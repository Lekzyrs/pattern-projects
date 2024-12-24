import { BarrierDamageHandler, BuffDebuffDamageHandler, InvulnerabilityDamageHandler, GameLogger } from './app';

jest.mock('./app', () => {
    const originalModule = jest.requireActual('./app');
    return {
        ...originalModule,
        GameLogger: {
            getInstance: jest.fn().mockReturnValue({
                log: jest.fn(),
            }),
        },
    };
});

describe('DamageHandler', () => {
    let logger: jest.Mocked<{ log: jest.Mock }>;

    beforeEach(() => {
        logger = GameLogger.getInstance() as unknown as jest.Mocked<{ log: jest.Mock }>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should pass damage through the chain of handlers', () => {
        GameLogger.getInstance();
        const handler1 = new BarrierDamageHandler(0);
        const handler2 = new BarrierDamageHandler(0);
        handler1.setNext(handler2);

        const result = handler1.handle(100);
        expect(result).toBe(100);
    });

    test('BarrierDamageHandler should block damage if barrier is strong enough', () => {
        GameLogger.getInstance();
        const barrierHandler = new BarrierDamageHandler(150);
        const result = barrierHandler.handle(100);

        expect(result).toBe(0);
        expect(logger.log).toHaveBeenCalledWith('У персонажа есть барьер с прочностью 150');
        expect(logger.log).toHaveBeenCalledWith('Барьер полностью поглотил урон');
        expect(logger.log).toHaveBeenCalledWith('Урон стал 0');
    });

    test('BarrierDamageHandler should pass remaining damage if barrier is not strong enough', () => {
        GameLogger.getInstance();
        const barrierHandler = new BarrierDamageHandler(50);
        const result = barrierHandler.handle(100);

        expect(result).toBe(50);
        expect(logger.log).toHaveBeenCalledWith('У персонажа есть барьер с прочностью 50');
        expect(logger.log).toHaveBeenCalledWith('Барьер персонажа был рассеян');
        expect(logger.log).toHaveBeenCalledWith('Урон стал 50');
    });

    test('BuffDebuffDamageHandler should modify damage correctly', () => {
        GameLogger.getInstance();
        const buffHandler = new BuffDebuffDamageHandler(1.5);
        const result = buffHandler.handle(100);

        expect(result).toBe(150);
        expect(logger.log).toHaveBeenCalledWith('На персонажа наложен эффект, который модифицирует урон в 1.5 раз!');
        expect(logger.log).toHaveBeenCalledWith('Урон стал 150');
    });

    test('InvulnerabilityDamageHandler should set damage to zero', () => {
        GameLogger.getInstance();
        const invulnerabilityHandler = new InvulnerabilityDamageHandler();
        const result = invulnerabilityHandler.handle(100);

        expect(result).toBe(0);
        expect(logger.log).toHaveBeenCalledWith('На персонажа наложена неуязвимость!!!');
    });

    test('should pass damage through the chain of different handlers', () => {
        GameLogger.getInstance();
        const barrierHandler = new BarrierDamageHandler(50);
        const buffHandler = new BuffDebuffDamageHandler(2);
        const invulnerabilityHandler = new InvulnerabilityDamageHandler();

        barrierHandler.setNext(buffHandler).setNext(invulnerabilityHandler);

        const result = barrierHandler.handle(30);
        expect(result).toBe(0);
        expect(logger.log).toHaveBeenCalledWith('У персонажа есть барьер с прочностью 50');
        expect(logger.log).toHaveBeenCalledWith('Барьер полностью поглотил урон');
        expect(logger.log).toHaveBeenCalledWith('Урон стал 0');
    });
});