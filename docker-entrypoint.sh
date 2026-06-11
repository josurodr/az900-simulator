#!/bin/sh
sed -i "s/NGINX_PORT/${PORT:-8080}/g" /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'
