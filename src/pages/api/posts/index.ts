export const prerender = false;

import type { APIRoute } from "astro";
import { verifyAdminSession, DEFAULT_ADMIN_PASSWORD } from "../../../lib/auth";
import { INITIAL_POSTS } from "../../../lib/posts";
import fs from "fs";
import path from "path";

export const GET: APIRoute = async ({ request, locals }) => {
  const envPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  const isAdmin = await verifyAdminSession(request, envPassword);

  try {
    const runtime = (locals as any)?.runtime;
    const db = runtime?.env?.DB;

    if (db) {
      // If admin, retrieve all posts (including soft-deleted). Otherwise, retrieve only active posts.
      const query = isAdmin
        ? "SELECT * FROM posts ORDER BY created_at DESC"
        : "SELECT * FROM posts WHERE is_deleted = 0 OR is_deleted IS NULL ORDER BY created_at DESC";

      const { results } = await db.prepare(query).all();
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

  const filteredInitial = isAdmin
    ? INITIAL_POSTS
    : INITIAL_POSTS.filter((p) => !p.is_deleted);

  return new Response(JSON.stringify(filteredInitial), {
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
    const { action, slug, title, description, category, author, content } = data;

    const runtime = (locals as any)?.runtime;
    const db = runtime?.env?.DB;

    // --- 1. RESTORE ACTION ---
    if (action === "restore" && slug) {
      if (db) {
        await db.prepare("UPDATE posts SET is_deleted = 0 WHERE slug = ? OR id = ?").bind(slug, slug).run();
      }
      return new Response(
        JSON.stringify({ success: true, message: `Article "${slug}" restored successfully!` }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- 2. SOFT DELETE ACTION ---
    if (action === "delete" && slug) {
      if (db) {
        await db.prepare("UPDATE posts SET is_deleted = 1 WHERE slug = ? OR id = ?").bind(slug, slug).run();
      }
      return new Response(
        JSON.stringify({ success: true, message: `Article "${slug}" moved to Trash!` }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- 3. PERMANENT DELETE ACTION ---
    if (action === "permanent_delete" && slug) {
      if (db) {
        await db.prepare("DELETE FROM posts WHERE slug = ? OR id = ?").bind(slug, slug).run();
      }
      try {
        const blogDir = path.join(process.cwd(), "src", "content", "blog");
        const filePath = path.join(blogDir, `${slug}.md`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {}

      return new Response(
        JSON.stringify({ success: true, message: `Article "${slug}" permanently deleted!` }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- 4. PUBLISH NEW ARTICLE ---
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

    if (db) {
      await db
        .prepare(
          `INSERT INTO posts (id, slug, title, description, pub_date, author, category, content, is_deleted) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0) 
           ON CONFLICT(slug) DO UPDATE SET 
           title=excluded.title, description=excluded.description, content=excluded.content, category=excluded.category, is_deleted=0`
        )
        .bind(cleanSlug, cleanSlug, title, description || "", pubDate, postAuthor, postCategory, content)
        .run();
    }

    // Write markdown file locally if writable
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
    } catch (fsErr) {}

    return new Response(
      JSON.stringify({
        success: true,
        message: "Article published successfully to D1 database!",
        post: {
          id: cleanSlug,
          slug: cleanSlug,
          title,
          description,
          pubDate,
          author: postAuthor,
          category: postCategory,
          content,
          is_deleted: 0,
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to process article request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
