/**
 * Class representing a sequence of values 
 * Currently, this implementation is not efficient (e.g. does a lot of array copying and is not lazily evaluated)
 * In a real scenario, this would most likely have to be addressed
 * For now, it serves as way to provide a clean functional interface 
 * (similar interface to e.g. streams in Java, however not the implementation)
 */
export class Sequence<T> {
    constructor(private items: T[]) { }

    static fromArray<U>(arr: U[]) {
        return new Sequence(arr);
    }

    filter(fn: (item: T) => boolean) {
        return new Sequence(this.items.filter(fn));
    }

    map<U>(fn: (item: T) => U) {
        return new Sequence(this.items.map(fn));
    }

    sort(compareFn: (a: T, b: T) => number) {
        const sorted = [...this.items].sort(compareFn);
        return new Sequence(sorted);
    }

    topK(k: number, compareFn?: (a: T, b: T) => number) {
        let result = [...this.items].sort(compareFn);
        return new Sequence(result.slice(0, k));
    }

    async mapAsync<U>(fn: (item: T) => Promise<U>) {
        const results = await Promise.all(this.items.map(fn));
        return new Sequence(results);
    }

    countBy<TKey>(keyFn: (item: T) => TKey) {
        const counts = new Map<TKey, number>();
        for (const item of this.items) {
            const key = keyFn(item);
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return new Sequence([...counts.entries()].map(([key, count]) => ({ key, count })));
    }

    toArray() {
        return this.items;
    }
}