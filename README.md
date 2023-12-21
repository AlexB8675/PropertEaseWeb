# PropertEaseWeb

## Project Proposal
- [OneDrive Parthenope](https://studentiuniparthenope-my.sharepoint.com/:p:/g/personal/alexandr_benbaccar001_studenti_uniparthenope_it/Edavrqbk98pHhYt6iivneegBkedgNNEckfzpn82c0q-KDg?e=Hrj34M)

## Running
To build and run this project you need to install the [Docker Engine](https://docs.docker.com/get-docker/) and run the following commands
```bash
git clone https://github.com/AlexB8675/PropertEaseWeb.git
cd PropertEaseWeb
docker build -t propert-ease:1.0 .
docker run -dit --name propert-ease-container -p 8080:80 -p 13331:13331 propert-ease:1.0
```

If the previous commands are successful you can now [open](http://localhost:8080) the web app.
