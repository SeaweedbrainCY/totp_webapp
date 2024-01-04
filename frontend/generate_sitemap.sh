#! /bin/bash

# This script generates a sitemap.xml file for the frontend.

# We associates path to their component for update time
tracked_path="/ /login /signup /vault /privacy /changelog"
associated_component="home/home.component.ts login/login.component.ts signup/signup.component.ts vault/vault.component.ts privacy-policy/privacy-policy.component.ts /changelog/changelog.component.ts"

IFS=' ' read -ra tracked_array <<< "$tracked_path"
IFS=' ' read -ra component_array <<< "$associated_component"

if [ ${#tracked_array[@]} -ne ${#component_array[@]} ]; then
    echo "Error, arrays don't have the same length."
    exit 1
fi

base="https://zero-totp.com"

echo '<?xml version="1.0" encoding="UTF-8"?>' > sitemap.xml
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' >> sitemap.xml

for ((i=0; i<${#tracked_array[@]}; i++)); do
    echo '<url>' >> sitemap.xml
    echo "<loc>$base${tracked_array[i]}</loc>" >> sitemap.xml
    echo '<priority>1</priority>' >> sitemap.xml
    component_path="${component_array[i]}"
    echo "<lastmod>$(git log -1 --pretty="format:%cs" src/app/$component_path)</lastmod>" >> sitemap.xml
    echo '</url>' >> sitemap.xml
done
echo '</urlset>' >> sitemap.xml
exit 0