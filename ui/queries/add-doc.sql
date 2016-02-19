drop table if exists test;

create table test (
	id serial primary key,
	name text
);

insert into test (
	name
)

values (
	'blah de dah'
);

select * from test;