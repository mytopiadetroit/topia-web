import axios from 'axios';

const WEBSITE_URL = 'https://www.mypsyguide.io';
// const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://api.mypsyguide.io/api';

function generateSiteMap(pages) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${pages
       .map(({ loc, lastmod, changefreq, priority }) => {
         return `
       <url>
           <loc>${loc}</loc>
           ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
           ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
           ${priority ? `<priority>${priority}</priority>` : ''}
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

function SiteMap() {
  
}

export async function getServerSideProps({ res }) {
  try {
    const pages = [];

   
    const staticPages = [
      { loc: `${WEBSITE_URL}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${WEBSITE_URL}/menu`, changefreq: 'daily', priority: '0.9' },
      { loc: `${WEBSITE_URL}/resourcecenter`, changefreq: 'daily', priority: '0.9' },
      { loc: `${WEBSITE_URL}/crazy-deals`, changefreq: 'daily', priority: '0.9' },
      { loc: `${WEBSITE_URL}/rewards`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${WEBSITE_URL}/wishlist`, changefreq: 'weekly', priority: '0.6' },
      { loc: `${WEBSITE_URL}/auth/login`, changefreq: 'monthly', priority: '0.5' },
      { loc: `${WEBSITE_URL}/auth/signup`, changefreq: 'monthly', priority: '0.5' },
    ];

    pages.push(...staticPages);

   
    try {
      const categoriesResponse = await axios.get(`${API_URL}/categories/categories`);
      if (categoriesResponse.data.success) {
        const categories = categoriesResponse.data.data;
        categories.forEach((category) => {
          pages.push({
            loc: `${WEBSITE_URL}/products/${category._id}`,
            lastmod: category.updatedAt ? new Date(category.updatedAt).toISOString() : new Date().toISOString(),
            changefreq: 'daily',
            priority: '0.8',
          });
        });
      }
    } catch (error) {
      console.error('Error fetching categories for sitemap:', error.message);
    }

    try {
      const contentResponse = await axios.get(`${API_URL}/content/public?limit=1000`);
      if (contentResponse.data.success) {
        const contents = contentResponse.data.data;
        contents.forEach((content) => {
        
          const urlPath = content.slug || content._id;
          pages.push({
            loc: `${WEBSITE_URL}/blog/${urlPath}`,
            lastmod: content.updatedAt ? new Date(content.updatedAt).toISOString() : new Date(content.publishedAt).toISOString(),
            changefreq: 'weekly',
            priority: '0.7',
          });
        });
      }
    } catch (error) {
      console.error('Error fetching content for sitemap:', error.message);
    }

    try {
      const productsResponse = await axios.get(`${API_URL}/products?limit=1000`);
      if (productsResponse.data.success) {
        const products = productsResponse.data.data;
        products.forEach((product) => {
          pages.push({
            loc: `${WEBSITE_URL}/productdetails?id=${product._id}`,
            lastmod: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
            changefreq: 'weekly',
            priority: '0.6',
          });
        });
      }
    } catch (error) {
      console.error('Error fetching products for sitemap:', error.message);
    }

   
    const sitemap = generateSiteMap(pages);

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.write(sitemap);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.statusCode = 500;
    res.end();
    return {
      props: {},
    };
  }
}

export default SiteMap;
