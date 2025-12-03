import React from 'react';

export default function TermsPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using CreatorAI ("the Service"), you agree to be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">2. Age Restriction</h2>
                    <p>
                        You must be at least 18 years old to use this Service. By using the Service, you represent and warrant
                        that you meet this age requirement.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">3. AI-Generated Content</h2>
                    <p>
                        The Service uses Artificial Intelligence to generate responses. You acknowledge that:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>AI responses are generated automatically and may be inaccurate or inappropriate.</li>
                        <li>You are responsible for your interactions with the AI characters.</li>
                        <li>We do not guarantee the accuracy or reliability of any AI-generated content.</li>
                        <li>You may not use the Service to generate illegal, harmful, or abusive content.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">4. Virtual Currency ("Coins")</h2>
                    <p>
                        The Service uses a virtual currency system. You acknowledge that:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Coins have no real-world monetary value.</li>
                        <li>Coins cannot be exchanged for cash or refunded.</li>
                        <li>We reserve the right to modify the cost of services at any time.</li>
                        <li>Purchased coins are non-refundable unless required by law.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">5. User Conduct</h2>
                    <p>
                        You agree not to:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Harass, abuse, or harm others.</li>
                        <li>Attempt to bypass security measures or rate limits.</li>
                        <li>Use the Service for any illegal purpose.</li>
                        <li>Share your account credentials with others.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">6. Termination</h2>
                    <p>
                        We reserve the right to terminate or suspend your account immediately, without prior notice or liability,
                        for any reason, including breach of these Terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at support@creatorai.com.
                    </p>
                </section>
            </div>
        </div>
    );
}
