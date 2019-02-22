#!/bin/bash

n=0
offset=1714
max=174100

while [ $offset -le $max ]; do
    curl -s -o "../list/$n.json" "https://chinadigitaltimes.net/chinese/wp-json/wp/v2/posts/?order=asc&per_page=100&orderby=id&offset=${offset}"
    echo "$n.json"
    offset=$(($offset+100))
    n=$(($n+1))
done

