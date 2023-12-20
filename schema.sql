drop table if exists House;
create table if not exists House (
    id      integer primary key autoincrement,
    plan    text    not null
);

drop table if exists Type;
create table if not exists Type (
    name varchar(255) primary key
);

drop table if exists User;
create table if not exists User (
    username    varchar(255) primary key,
    password    varchar(255) not null,
    permissions integer      not null
);

insert into Type values ('Studio Apartment');
insert into Type values ('Two-Room Apartment');
insert into Type values ('Three-Room Apartment');
insert into Type values ('Four-Room Apartment');
insert into Type values ('Multi-Room Apartment');
insert into Type values ('Loft');
insert into Type values ('Independent House');
insert into Type values ('Cottage');

-- Password: admin
insert into User values ('admin', 'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec', 0xffffffff);
