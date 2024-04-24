<?php

// File list.
$dir = '../src';

$rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));

$files = array(); 
foreach ($rii as $file) {
if ( false !== strpos( $file->getPathname(), '.md' ) ) {
		$files[] = $file->getPathname();
	}
}

foreach ( $files as $file ) {
	$fh = fopen( $file, 'r' );
	$content = fread( $fh, filesize( $file ) );
	$altered_content = preg_replace( '|<figure .*https://www.youtube.com/embed/([^?]+)?.*</figure>|', 'https://youtu.be/$1', $content );
	if ( $altered_content !== $content ) {
		fclose( $fh );
		$fh = fopen( $file, 'w' );
		fwrite( $fh, $altered_content );
	}

	fclose( $fh );
}

