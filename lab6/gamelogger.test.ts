import { GameLogger } from "./app";
import { describe, expect, jest, beforeAll, afterAll } from '@jest/globals';

describe('GameLogger', () => {
    let logger: GameLogger;

    beforeAll(() => {
        logger = GameLogger.getInstance();
    });

    afterAll(() => {

        (GameLogger as any).instance = null;
    });

    test('should return the same instance', () => {
        const logger1 = GameLogger.getInstance();
        const logger2 = GameLogger.getInstance();
        expect(logger1).toBe(logger2);
    });

    test('should log correctly', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const message = 'Test message';
        logger.log(message);
        expect(consoleSpy).toHaveBeenCalledWith(`[GAME LOG]: ${message}`);
        consoleSpy.mockRestore();
    });
});