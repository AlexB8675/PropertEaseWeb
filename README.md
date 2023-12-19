# PropertEaseWeb

## Project Proposal
- [OneDrive Parthenope](https://studentiuniparthenope-my.sharepoint.com/:p:/g/personal/alexandr_benbaccar001_studenti_uniparthenope_it/Ee6KwVJelLJHin2qzNJS0aABSmvxKxIUtsIDnkvrNbuIlw?e=3dGPjz)

## Running
To build and run this project you need to install the [Docker Engine](https://docs.docker.com/engine/install/) and run the following commands
```bash
git clone https://github.com/AlexB8675/PropertEaseWeb.git
cd PropertEaseWeb
docker build -t propert-ease:1.0 .
docker run -dit --name propert-ease-container -p 8080:80 -p 13331:13331 propert-ease:1.0
```
