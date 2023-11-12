drop table if exists House;
create table if not exists House (
    id          integer      primary key autoincrement,
    address     varchar(255) not null,
    city        varchar(255) not null,
    cap         varchar(255) not null,
    -- 0: Vendita, 1: Affitto
    contract    integer      not null,
    price       integer      not null,
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

insert into House (address, city, cap, contract, price, e_type) values ('Street Roma 1', 'Roma', '00100', 0, 5000, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Roma 2', 'Roma', '00100', 0, 86000, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Roma 3', 'Roma', '00100', 0, 351000, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Roma 4', 'Roma', '00100', 0, 51000, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Roma 5', 'Roma', '00100', 0, 23000, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Milano 1', 'Milano', '20100', 1, 752000, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Milano 2', 'Milano', '20100', 1, 234000, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Milano 3', 'Milano', '20100', 1, 75000, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Milano 4', 'Milano', '20100', 1, 64000, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Milano 5', 'Milano', '20100', 1, 11000, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Torino 1', 'Torino', '10100', 0, 1, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Torino 2', 'Torino', '10100', 0, 86345, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Torino 3', 'Torino', '10100', 0, 86421, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Torino 4', 'Torino', '10100', 0, 13248, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Torino 5', 'Torino', '10100', 1, 74935, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Napoli 1', 'Napoli', '80100', 1, 52157, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Napoli 2', 'Napoli', '80100', 1, 355667, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Napoli 3', 'Napoli', '80100', 1, 462772, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Napoli 4', 'Napoli', '80100', 1, 12155, 'Four-Room Apartment');
insert into House (address, city, cap, contract, price, e_type) values ('Street Napoli 5', 'Napoli', '80100', 1, 16473, 'Four-Room Apartment');

insert into Type values ('Studio Apartment');
insert into Type values ('Two-Room Apartment');
insert into Type values ('Three-Room Apartment');
insert into Type values ('Four-Room Apartment');
insert into Type values ('Loft');
insert into Type values ('Independent House');

-- Password: admin
insert into User values ('admin', 'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec', 0xffffffff);
