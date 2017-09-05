#!/bin/bash
killall node
read -t 5 -p "Do you want to clean the log directory?[y/s]:" result
if [ "$result" == "y" ];then
    echo "Try to clean the log directory......"
    rm -fr ./log/*
    ls -al ./log/
else
    echo "Do nothing......"
fi
screen -dmS master node app.js master
