import { ResponseOptimizer } from './types';
import { initializeResponseOptimizer } from './responseOptimizer';

describe('Response Optimizer', () => {
    let optimizer: ResponseOptimizer;

    beforeEach(() => {
        optimizer = initializeResponseOptimizer();
    });

    describe('Code Formatting', () => {
        it('should format TypeScript code blocks correctly', () => {
            const input = '```typescript\nfunction test(){return 42;}\n```';
            const formatted = optimizer.format(input);
            expect(formatted).toContain('```typescript');
            expect(formatted).toContain('function test()');
            expect(formatted).toContain('return 42;');
        });

        it('should format JavaScript code blocks correctly', () => {
            const input = '```javascript\nconst x=1;const y=2;function add(){return x+y;}\n```';
            const formatted = optimizer.format(input);
            expect(formatted).toContain('```javascript');
            expect(formatted).toContain('const x = 1;');
            expect(formatted).toContain('const y = 2;');
            expect(formatted).toContain('function add()');
            expect(formatted).toContain('return x + y;');
        });

        it('should handle multiple code blocks', () => {
            const input =
                '```typescript\nconst x=1;\n```\nSome text\n```javascript\nconst y=2;\n```';
            const formatted = optimizer.format(input);
            expect(formatted).toContain('const x = 1;');
            expect(formatted).toContain('Some text');
            expect(formatted).toContain('const y = 2;');
        });

        it('should preserve non-code content', () => {
            const text = 'Regular text\n```python\ndef test(): pass\n```\nMore text';
            expect(optimizer.format(text)).toBe(text);
        });
    });

    describe('Compression and Decompression', () => {
        it('should not compress small data', async () => {
            const data = 'Small text';
            const compressed = await optimizer.compress(data);
            expect(compressed).toBe(data);
        });

        it('should compress and decompress large data', async () => {
            const data = 'A'.repeat(2000);
            const compressed = await optimizer.compress(data);
            const decompressed = await optimizer.decompress(compressed);
            expect(decompressed).toBe(data);
            expect(compressed.startsWith('GZIP:')).toBe(true);
        });

        it('should handle compression errors gracefully', async () => {
            const data = undefined as any;
            const result = await optimizer.compress(data);
            expect(result).toBe('');
        });

        it('should handle decompression errors gracefully', async () => {
            const data = 'GZIP:invalid_data';
            const result = await optimizer.decompress(data);
            expect(result).toBe(data);
        });
    });

    describe('Cache Management', () => {
        it('should cache and retrieve responses', () => {
            const query = 'test query';
            const response = 'test response';

            optimizer.cacheResponse(query, response);
            const cached = optimizer.getCachedResponse(query);
            expect(cached).toBe(response);
        });

        it('should handle cache misses', () => {
            const result = optimizer.getCachedResponse('non-existent');
            expect(result).toBeNull();
        });

        it('should update cache hit rate on multiple hits', () => {
            const query = 'test query';
            optimizer.cacheResponse(query, 'response');

            // Premier accès
            optimizer.getCachedResponse(query);
            const metrics1 = optimizer.getMetrics();

            // Deuxième accès
            optimizer.getCachedResponse(query);
            const metrics2 = optimizer.getMetrics();

            expect(metrics2.cacheHitRate).toBeGreaterThanOrEqual(metrics1.cacheHitRate);
        });

        it('should respect maximum cache size', () => {
            // Remplir le cache au-delà de sa capacité
            for (let i = 0; i < 1100; i++) {
                optimizer.cacheResponse(`query${i}`, `response${i}`);
            }

            const metrics = optimizer.getMetrics();
            expect(metrics.cacheSize).toBeLessThanOrEqual(metrics.maxCacheSize);
        });
    });

    describe('Metrics', () => {
        it('should track response time correctly', () => {
            optimizer.recordMetric('responseTime', 100);
            optimizer.recordMetric('responseTime', 200);

            const metrics = optimizer.getMetrics();
            expect(metrics.averageResponseTime).toBe(150);
        });

        it('should track compression ratio', () => {
            optimizer.recordMetric('compressionRatio', 2.5);

            const metrics = optimizer.getMetrics();
            expect(metrics.compressionRatio).toBe(2.5);
        });

        it('should calculate cache hit rate correctly', () => {
            optimizer.cacheResponse('query1', 'response1');
            optimizer.getCachedResponse('query1'); // Hit
            optimizer.getCachedResponse('query2'); // Miss

            const metrics = optimizer.getMetrics();
            expect(metrics.cacheHitRate).toBe(0.5);
        });

        it('should track cache size', () => {
            optimizer.cacheResponse('query1', 'response1');
            optimizer.cacheResponse('query2', 'response2');

            const metrics = optimizer.getMetrics();
            expect(metrics.cacheSize).toBe(2);
        });
    });
});
