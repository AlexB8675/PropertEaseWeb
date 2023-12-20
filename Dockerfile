FROM ubuntu:devel
ENV TZ=Europe/Rome
RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install apache2 nodejs npm curl wget sed software-properties-common language-pack-en-base -y && \
    a2enmod rewrite && \
    export LANG=en_US.UTF-8 && \
    service apache2 restart && \
    rm -rf /var/www/html/*
COPY . /var/www/html/
EXPOSE 80
EXPOSE 13331
RUN apt-get install -y supervisor && \
    mkdir -p /var/log/supervisor
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_PID_FILE /var/run/apache2.pid
ENV APACHE_RUN_DIR /var/run/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_LOG_DIR /var/log/apache
COPY supervisord.conf /etc/supervisor/conf.d/
WORKDIR /var/www/html/
RUN cd ./backend && \
    npm install
CMD ["/usr/bin/supervisord"]
