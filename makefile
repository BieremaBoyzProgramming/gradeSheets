# Created: 2015-08-17
# Author: Bierema Boyz Publishing
# Copyright (c) 2015 Bierema Boyz Publishing. All rights reserved.

srcJs = $(patsubst src/%,build/lib/%,$(wildcard src/*.js))
docs = $(patsubst %,build/%,$(wildcard *.txt))
buildContents = $(docs) build/gradeSheets.html $(srcJs) \
		build/lib/gradeSheets.css build/lib/d3.min.js build/examples/Geom7.csv

all: gradeSheets.zip

buildContents: $(buildContents)

gradeSheets.zip: $(buildContents)
	cd build; 7z u ../gradeSheets.zip *

build build/lib build/examples srcMaps:
	mkdir --parents $@

clean:
	rm --recursive --force srcMaps
	rm --recursive --force build
	rm --force gradeSheets.zip

.SECONDEXPANSION:

$(srcJs): build/lib/%: src/% | $$(@D) srcMaps
	echo -n > srcMaps/$(@F).map
	uglifyjs $< --output $@ --source-map srcMaps/$(@F).map \
		--source-map-root .. --source-map-url ../../srcMaps/$(@F).map --screw-ie8 \
		--mangle --compress --comments

$(docs) build/lib/d3.min.js: build/%: % | $$(@D)
	cp $< $@

build/gradeSheets.html: build/%: src/% | $$(@D)
	cp $< $@

build/lib/gradeSheets.css: build/lib/%: src/% | $$(@D)
	cp $< $@

build/examples/Geom7.csv: build/examples/%.csv: testInput/%.tsv | $$(@D)
	cp $< $@