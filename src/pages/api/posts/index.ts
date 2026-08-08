export const prerender = false;

import type { APIRoute } from "astro";
import { verifyAdminSession, DEFAULT_ADMIN_PASSWORD } from "../../../lib/auth";
import { INITIAL_POSTS } from "../../../lib/posts";
import fs from "fs";
import path from "path";

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(INITIAL_POSTS), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
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

    const markdownContent = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${(description || "").replace(/"/g, '\\"')}"
pubDate: ${pubDate}
author: "${author || "Mukesh (@mukeshv-tech)"}"
category: "${category || "Product Update"}"
---

${content}
`;

    // Attempt to write markdown file in local workspace if filesystem is writable
    try {
      const blogDir = path.join(process.cwd(), "src", "content", "blog");
      if (!fs.existsSync(blogDir)) {
        fs.mkdirSync(blogDir, { recursive: true });
      }
      fs.writeFileSync(path.join(blogDir, `${cleanSlug}.md`), markdownContent, "utf8");
    } catch (fsErr) {
      console.warn("Local filesystem write skipped (serverless environment):", fsErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Blog post created successfully",
        post: {
          id: cleanSlug,
          slug: cleanSlug,
          title,
          description,
          pubDate,
          author: author || "Mukesh (@mukeshv-tech)",
          category: category || "Product Update",
          content,
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
