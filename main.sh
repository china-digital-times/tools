#!/bin/bash

n=1724
offset=174112
max=174700

while [ $offset -le $max ]; do
    curl -s -o "../list/$n.json" "https://chinadigitaltimes.net/chinese/wp-json/wp/v2/posts/?order=asc&per_page=100&orderby=id&offset=${offset}"
    echo "$n.json"
    offset=$(($offset+100))
    n=$(($n+1))
done

