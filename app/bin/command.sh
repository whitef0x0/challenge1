#!/bin/bash
cd /code
nodemon --watch /var/www/site --watch /code -e js,pug,gif extract_data.js