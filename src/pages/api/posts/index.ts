export const prerender = false;

import type { APIRoute } from "astro";
import { verifyAdminSession, DEFAULT_ADMIN_PASSWORD } from "../../../lib/auth";
import { INITIAL_POSTS } from "../../../lib/posts";
import fs from "fs";
import path from "path";

export const GET: APIRoute = async ({ locals }) => {
  try {
    // Attempt reading from Cloudflare D1 Database binding
    const runtime = (locals as any)?.runtime;
    const db = runtime?.env?.DB;

    if (db) {
      const { results } = await db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
      if (results && results.length > 0) {
        return new Response(JSON.stringify(results), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  } catch (d1Err) {
    console.warn("D1 Database query fallback to default posts:", d1Err);
  }

  return new Response(JSON.stringify(INITIAL_POSTS), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const envPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  const isAuthenticated = await verifyAdminSession(request, envPassword);

  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: "Unauthorized: Admin session required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await request.json();
    const { title, slug, description, category, author, content } = data;

    if (!title || !slug || !content) {
      return new Response(JSON.stringify({ error: "Missing required fields (title, slug, content)" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const pubDate = new Date().toISOString().split("T")[0];
    const postAuthor = author || "Mukesh (@mukeshv-tech)";
    const postCategory = category || "Product Update";

    // 1. Save to Cloudflare D1 Database if binding exists
    let savedToD1 = false;
    try {
      const runtime = (locals as any)?.runtime;
      const db = runtime?.env?.DB;

      if (db) {
        await db
          .prepare(
            `INSERT INTO posts (id, slug, title, description, pub_date, author, category, content) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
             ON CONFLICT(slug) DO UPDATE SET 
             title=excluded.title, description=excluded.description, content=excluded.content, category=excluded.category`
          )
          .bind(cleanSlug, cleanSlug, title, description || "", pubDate, postAuthor, postCategory, content)
          .run();
        savedToD1 = true;
      }
    } catch (d1Err) {
      console.warn("Cloudflare D1 insert warning:", d1Err);
    }

    // 2. Save markdown file locally if filesystem is writable
    const markdownContent = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${(description || "").replace(/"/g, '\\"')}"
pubDate: ${pubDate}
author: "${postAuthor}"
category: "${postCategory}"
---

${content}
`;

    try {
      const blogDir = path.join(process.cwd(), "src", "content", "blog");
      if (!fs.existsSync(blogDir)) {
        fs.mkdirSync(blogDir, { recursive: true });
      }
      fs.writeFileSync(path.join(blogDir, `${cleanSlug}.md`), markdownContent, "utf8");
    } catch (fsErr) {
      // Local filesystem read-only in serverless
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: savedToD1
          ? "Article successfully published to Cloudflare D1 database!"
          : "Article created successfully!",
        post: {
          id: cleanSlug,
          slug: cleanSlug,
          title,
          description,
          pubDate,
          author: postAuthor,
          category: postCategory,
          content,
          d1Saved: savedToD1,
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to create blog post" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
