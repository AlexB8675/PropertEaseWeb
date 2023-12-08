drop table if exists House;
create table if not exists House (
    id          integer      primary key autoincrement,
    address     varchar(255) not null,
    city        varchar(255) not null,
    cap         varchar(255) not null,
    description text         not null,
    -- 0: Sale, 1: Rent
    contract    integer      not null,
    price       integer      not null,
    floor       integer      not null,
    elevator    boolean      not null,
    balconies   integer      not null,
    terrace     integer      not null,
    garden      integer      not null,
    accessories integer      not null,
    bedrooms    integer      not null,
    plan        text         not null,
    images      text         not null,
    e_type      varchar(255) not null,

    check (contract in (0, 1)),
    foreign key (e_type)
        references Type (name)
            on delete cascade
            on update cascade
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

-- Password: admin
insert into User values ('admin', 'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec', 0xffffffff);
