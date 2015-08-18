# Created: 2015-08-17
# Author: Bierema Boyz Publishing
# Copyright (c) 2015 Bierema Boyz Publishing. All rights reserved.

srcJs = $(patsubst src/%,dist/lib/%,$(wildcard src/*.js))

all: dist/LICENSE.txt dist/gradeSheets.html $(srcJs) dist/lib/gradeSheets.css \
		dist/lib/d3.min.js dist/examples/Geom7.csv

dist dist/lib dist/examples build:
	mkdir --parents $@

clean:
	rm --recursive --force dist
	rm --recursive --force build

.SECONDEXPANSION:

$(srcJs): dist/lib/%: src/% | $$(@D) build
	echo -n > build/$(@F).map
	uglifyjs $< --output $@ --source-map build/$(@F).map \
		--source-map-root .. --source-map-url ../../build/$(@F).map --screw-ie8 \
		--mangle --compress --comments

dist/LICENSE.txt dist/lib/d3.min.js: dist/%: % | $$(@D)
	cp $< $@

dist/gradeSheets.html: dist/%: src/% | $$(@D)
	cp $< $@

dist/lib/gradeSheets.css: dist/lib/%: src/% | $$(@D)
	cp $< $@

dist/examples/Geom7.csv: dist/examples/%.csv: testInput/%.tsv | $$(@D)
	cp $< $@