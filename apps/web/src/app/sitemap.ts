import { MetadataRoute } from 'next'
import { PERSONAS } from '@/lib/personas'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://syelope.com' // Replace with actual production URL if known, or leave as placeholder

    const personaUrls = Object.values(PERSONAS).map((persona) => ({
        url: `${baseUrl}/public-chat/${persona.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...personaUrls,
    ]
}
