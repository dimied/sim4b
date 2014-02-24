#!/bin/bash
#
# Copies some file which might be useful in your project.
#
sep="_:_"
modpath="./src/modules/"
deps=("/var/www/basic/js/jshint.js"$sep$modpath"JSEditor/")

for d in ${deps[@]} ; do
	echo $d
	pair=(${d/"$sep"/ })
	srcfile=${pair[0]}
	dstdir=${pair[1]}
	echo $srcfile
	echo $dstdir
	if [ -f "$srcfile" ] 
	then
		if [ ! -d "$dstdir" ]
		then
			echo "Folder doesn't exist: "$dstdir
			echo "Trying to create the folder ... "
			mkdir -p $dstdir
		fi
		echo "Copying file"
		cp $srcfile $dstdir
	else
		echo "File doesn't exist: "$srcfile
	fi
done

#
#
#
