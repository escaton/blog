all: npm bower enb

npm:
	cd src && npm i

bower:
	cd src && ./node_modules/.bin/bower i

enb:
	cd src && ./node_modules/.bin/enb make

server:
	cd src && ./node_modules/.bin/enb server

clean:
	cd src && ./node_modules/.bin/enb make clean
