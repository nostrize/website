# website

nostrize.me

# build & run

* Build docker image

`docker build -t nostrize-website .`

* Run the container

`docker run --name nostrize-website -p 3005:3005 --env-file .env.local nostrize-website`

`docker run --name nostrize-website -p 3005:3005 --env-file .env.local -v /etc/secrets:/etc/secrets nostrize-website`
