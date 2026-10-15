export default [
  {
    name: "Nginx",
    category: "server",
    website: "https://nginx.org",
    color: "#009639",
    headers: { server: { pattern: /nginx(?:\/([\d.]+))?/i, version: "\\1" } }
  },
  {
    name: "Apache HTTP Server",
    category: "server",
    website: "https://httpd.apache.org",
    color: "#d22128",
    headers: { server: { pattern: /Apache(?:\/([\d.]+))?(?!-Coyote)/i, version: "\\1" } }
  },
  {
    name: "Apache Tomcat",
    category: "server",
    website: "https://tomcat.apache.org",
    color: "#f8dc75",
    implies: ["Java"],
    headers: { server: /Apache-Coyote|Tomcat/i }
  },
  {
    name: "LiteSpeed",
    category: "server",
    website: "https://www.litespeedtech.com",
    color: "#0d6efd",
    // Behind a CDN the `server` header is the CDN's, but these survive
    headers: { server: /LiteSpeed/i, "x-turbo-charged-by": /LiteSpeed/i, "x-litespeed-cache": { weight: 90 } }
  },
  {
    name: "Microsoft IIS",
    category: "server",
    website: "https://www.iis.net",
    color: "#0078d4",
    headers: { server: { pattern: /Microsoft-IIS(?:\/([\d.]+))?/i, version: "\\1" } }
  }
];
