drop table if exists House;
create table if not exists House (
    id          integer primary key autoincrement,
    address     varchar(255) not null,
    city        varchar(255) not null,
    cap         varchar(255) not null
);

insert into House (address, city, cap) values ('Via Roma 1', 'Roma', '00100');
insert into House (address, city, cap) values ('Via Roma 2', 'Roma', '00100');
insert into House (address, city, cap) values ('Via Roma 3', 'Roma', '00100');
insert into House (address, city, cap) values ('Via Roma 4', 'Roma', '00100');
insert into House (address, city, cap) values ('Via Roma 5', 'Roma', '00100');
insert into House (address, city, cap) values ('Via Milano 1', 'Milano', '20100');
insert into House (address, city, cap) values ('Via Milano 2', 'Milano', '20100');
insert into House (address, city, cap) values ('Via Milano 3', 'Milano', '20100');
insert into House (address, city, cap) values ('Via Milano 4', 'Milano', '20100');
insert into House (address, city, cap) values ('Via Milano 5', 'Milano', '20100');
insert into House (address, city, cap) values ('Via Torino 1', 'Torino', '10100');
insert into House (address, city, cap) values ('Via Torino 2', 'Torino', '10100');
insert into House (address, city, cap) values ('Via Torino 3', 'Torino', '10100');
insert into House (address, city, cap) values ('Via Torino 4', 'Torino', '10100');
insert into House (address, city, cap) values ('Via Torino 5', 'Torino', '10100');
insert into House (address, city, cap) values ('Via Napoli 1', 'Napoli', '80100');
insert into House (address, city, cap) values ('Via Napoli 2', 'Napoli', '80100');
insert into House (address, city, cap) values ('Via Napoli 3', 'Napoli', '80100');
insert into House (address, city, cap) values ('Via Napoli 4', 'Napoli', '80100');
insert into House (address, city, cap) values ('Via Napoli 5', 'Napoli', '80100');
