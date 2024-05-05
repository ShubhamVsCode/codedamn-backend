#!/bin/bash
sudo apt update -y && sudo apt autoremove -y && sudo apt clean -y
sudo mkdir -p /home/ubuntu/code
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo docker run -d -p 4000:4000 -v /home/ubuntu/code:/app shubhamvscode/sandbox
sudo chown -R ubuntu:ubuntu /home/ubuntu/code
