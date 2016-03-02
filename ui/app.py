import os
import sys
import h5py
import json
import operator
import web
import psycopg2
import numpy as np

from PIL import Image

sys.path.append("..")

urls = (
    # rest API backend endpoints
    "/rest/static/(.*)", "static_data",
    "/rest/similarity/(dataset|image)/(.*)", "similarity",
    "/rest/classification/(.*)", "classification",
    "/rest/ingest", "ingest",
    # front-end routes to load angular app
    "/", "index",
    "/(.+)", "www"
)

def store_doc(host):
    
    try:
        # establish connection
        conn = psycopg2.connect("dbname='postgres' user='postgres' host='" + host + "' password='pguser'")
        
        # get a cursor
        cur = conn.cursor()
        
        # set up query string
        #query = "insert into control (name, modified) values (%(model_name)s, now())"
        query = "select * from test"
        
        # open execute a query
        #cur.executemany(query, models)
        cur.execute(query)
        
        # get results
        rows = cur.fetchall()
        
        return rows
        
        # commit the query
        #conn.commit()
        
        # close connection
        conn.close()
        
    except:
        print "can't make connection"

class www:
    def GET(self, filename):
        
        try:
            f = open('www/' + filename)
            if filename.endswith(".css"):
                web.header("Content-Type","text/css")
            return f.read() # or return f.read() if you're using 0.3
        except IOError: # No file named that
            web.notfound()
            
class index:
    def GET(self):
        
        try:
            f = open("www/index.html")
            return f.read()
        except IOError:
            web.notfound()
    
class classification:
    def GET(self, doc_id):
        
        # set up params
        i = web.input(doc_id=None)
        params = web.input()

        feats_path = "data/fiel_feat_icdar13_100shingles.hdf5"
        model_path = None

        # get correct author (HACK)
        correct_author_id = doc_id.split("_")[0]

        # retrieve features (a lookup, for now)
        with h5py.File(feats_path) as f:
            doc_feats = f[correct_author_id][doc_id + ".tif"].value
            # take mean over shingles
            doc_feats = np.mean(doc_feats, axis=0)
        
        # run classifier
        author_probs = foo.authorProbs(model_path, doc_feats)
        
        # get top K authors
        num_authors = 5
        author_limit = min(num_authors, len(author_probs))
        probability_cutoff = np.sort([-prob for prob in author_probs.itervalues()])[num_authors]
        authors_list = [ {"id": author, "value": prob} for author, prob in author_probs.iteritems() 
            if prob > probability_cutoff ]
        
        # sort by probability
        authors_list = sorted(authors_list, key=operator.itemgetter("value"), reverse=True)
        result = {
            "id": doc_id,
            "author_id" : correct_author_id,
            "authors": authors_list }
        
        # return data object
        return json.dumps(result)
    
class static_data:
    def GET(self, name):
        
        # set up params
        i = web.input(name=None)
        params = web.input()
        
        try:
            f = open("data/" + name + ".json")
            return f.read()
        except IOError:
            web.notfound()
            
class ingest:
    def GET(self):
        
        # set up params
        i = web.input(name=None)
        params = web.input()
        
        try:
            data = store_doc(host_name)
        except IOError:
            web.notfound()
            
        return data
        
class similarity:
    
    @staticmethod
    def get_img(img_path, data_path="data/images_base64.hdf5"):
        
        # return base64-encoded string representing img i
        img_path = "{}/{}".format(attributes['image_dir'],
                                    attributes['image_filenames'][i])
        with h5py.File(data_path) as img_corpus:
            img_b64 = img_corpus[img_path]
        return img_b64
    
    def GET(self, mode, data_set):
        
        data = {}
        
        def get_author_id(i):
            raise NotImplementedError
            
        def get_fragment_id(i):
            raise NotImplementedError
            
        def get_full_id(i, attributes):
            
            writer_id = attributes['writer_ids'][i]
            doc_id = attributes['doc_ids'][i]
            full_id = "{0}_{1}".format(writer_id, doc_id)
            return full_id
        
        def getNodes(data_set):
            
            # read in file (use with context to make sure it closes)
            with h5py.File("data/document_distances.hdf5", "r") as f:
                # get keys
                keys = f.keys()
                key_idx = keys.index(data_set)
                # maybe make this a parameter
                dataset_key = keys[key_idx]
                dataset_to_use = f[dataset_key]
                # because there is just one we can set it here
                # if we have more than one key we can loop in the future
                matrix = np.array(dataset_to_use)
                metadata = dict(dataset_to_use.attrs)

            # empty array for node attributes
            nodes = []

            # loop through matrix to populate node id
            for i in xrange(matrix.shape[0]):
                node_full_id = get_full_id(i, metadata)

                # img_path is notional
                # can be passed to static get_img method to get b64-encoded png
                img_path = "{}/{}".format(metadata['image_dir'],
                                            metadata['image_filenames'][i])
                nodes.append({"id": node_full_id, "image_path": img_path})

            data = { "nodes": nodes, "matrix": matrix.tolist() }
            
            return data
            
        if mode == "dataset":
            data = getNodes(data_set)
        elif mode == "image":
            data = similarity.get_img()
        
        return json.dumps(data)
    
app = web.application(urls, globals())
    
if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
