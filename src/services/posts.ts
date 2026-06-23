import { posts as seedPosts, type Post } from "@/mocks/posts";

const STORAGE_KEY = "lumina:posts";

const normalizePost = (post: Post): Post => ({
  ...post,
  status: post.status ?? "published",
  featured: post.featured ?? false,
});

export const loadPosts = (): Post[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const source = raw ? (JSON.parse(raw) as Post[]) : seedPosts;
    return source.map(normalizePost);
  } catch {
    return seedPosts.map(normalizePost);
  }
};

export const savePosts = (posts: Post[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.map(normalizePost)));
  window.dispatchEvent(new Event("lumina:posts-updated"));
};

export const loadPublishedPosts = () =>
  loadPosts()
    .filter((post) => post.status === "published")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

export const findPublishedPost = (slug: string | undefined) =>
  loadPublishedPosts().find((post) => post.slug === slug) ?? null;
