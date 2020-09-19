const rssPlugin = require('@11ty/eleventy-plugin-rss');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

// Import filters
const dateFilter = require('./src/filters/date-filter.js');
const dateFilterAlt = require('./src/filters/date-filter-alt.js');
const markdownFilter = require('./src/filters/markdown-filter.js');
const w3DateFilter = require('./src/filters/w3-date-filter.js');

// Import transforms
const htmlMinTransform = require('./src/transforms/html-min-transform.js');
const parseTransform = require('./src/transforms/parse-transform.js');

// Import data files
const site = require('./src/_data/site.json');

module.exports = function(config) {
  // Filters
  config.addFilter('dateFilter', dateFilter);
  config.addFilter('dateFilterAlt', dateFilterAlt);
  config.addFilter('markdownFilter', markdownFilter);
  config.addFilter('w3DateFilter', w3DateFilter);

  // Layout aliases
  config.addLayoutAlias('home', 'layouts/home.njk');

  // Transforms
  config.addTransform('htmlmin', htmlMinTransform);
  config.addTransform('parse', parseTransform);

  // Passthrough copy
  config.addPassthroughCopy('src/fonts');
  config.addPassthroughCopy('src/images');
  config.addPassthroughCopy('src/js');
  config.addPassthroughCopy('src/admin/config.yml');
  config.addPassthroughCopy('src/admin/previews.js');
  config.addPassthroughCopy('node_modules/nunjucks/browser/nunjucks-slim.js');

  const now = new Date();

  // Custom collections
  const livePosts = post => post.date <= now && !post.data.draft;
  const public = post => !post.data.tags.includes('notes');

  config.addCollection('posts', collection => {
    return [
      ...collection
        .getFilteredByGlob('./src/posts/*.md')
        .filter(livePosts)
        .filter(public)
    ].reverse();
  });

  config.addCollection('postFeed', collection => {
    return [
      ...collection
        .getFilteredByGlob('./src/posts/*.md')
        .filter(livePosts)
        .filter(public)
    ]
      .reverse()
      .slice(0, site.maxPostsPerPage);
  });

  config.addCollection('notes', collection => {
    return [...collection.getFilteredByTag('notes').filter(livePosts)]
      .reverse()
      .slice(0, site.maxPostsPerPage);
  });

  // Returns workshops
  config.addCollection('speaking', collection => {
    return collection.getFilteredByGlob('./src/speaking/*.md');
  });

  // Plugins
  config.addPlugin(rssPlugin);
  config.addPlugin(syntaxHighlight);

  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    passthroughFileCopy: true
  };
};
