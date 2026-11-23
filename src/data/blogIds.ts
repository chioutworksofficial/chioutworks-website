// Article ids (same in every language, in the order of BLOG_POSTS.en in sections.ts). The router checks blog URLs against this
// so it does not load the article texts. sections.ts warns in development when the two lists differ.
export const BLOG_IDS = ['ai-jobs-reality', 'digital-or-decline', 'ai-benefits-risks', 'small-business-ai-today', 'automate-5-processes', 'ai-actually-saves-time', 'trustworthy-website', 'ship-worker-to-tech'] as const;
