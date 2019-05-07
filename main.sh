#!/bin/bash

n=0
offset=0
max=171093

while [ $offset -le $max ]; do
    curl -s -o "../media-list/$n.json" "https://chinadigitaltimes.net/chinese/wp-json/wp/v2/media/?order=asc&per_page=100&orderby=id&offset=${offset}"
    echo "$n.json"
    offset=$(($offset+100))
    n=$(($n+1))
done

