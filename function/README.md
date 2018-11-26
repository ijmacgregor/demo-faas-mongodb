# Function
cf login

faas function deploy productservice  -f index.js -d package.json -c mongodb-credentials -m productservice.handler -s faasdemo -k sk

faas httptrigger deploy product-trigger -f productservice -s faasdemo -k sk