/*
Примечание - пытаюсь использовать элементы декларативного программирования
причина в плохом типе мышления - я портянку if/else плохо понимаю, а компактный массив - хорошо

Для этой работы массивы хорошо подходят, т.к. тут часто используется одно и то же
например  primitiveTypes  и real_types.
Скорее всего можно было сделать лучше - не писать такое - "Null/object": null
Но тесты проходят, поэтому не стал менять (я не очень понял задание - нужен Null в getType, нужно его опознавать отдельно и т.п.)

Я знаю, что цикл in не рекомендуют к использованию for (let key in arr) - это плохо.
Но с редукцией/фильтрами я делал только несколько примеров на питоне и не понимаю как их отлаживать на JS

Исправления исходного кода - все типы сделал начинающиеся с большой буквы
пришлось преределать исходный код.
причина - наличие функции map - конфликт имён. вместо свойства map берётся функция map.
свойства Map - нету и нормально работает.
Можно было несколькими путями пойти но этот самый простой и наглядный.

Ещё испрваление - const knownTypes на let
я не понял как его переопределять (целиком)
причина переопределения - я в переменную весь исходный список типов пихаю (мне не надо каждый тип по-отдельности писать)

На текущем уровне изучения JS я лучше не смогу написать.
Возможно нарушил штук 10 правил хорошего тона, но даже если я и вижу, что код не очень - я не знаю как написать красиво.
*/

//  Разделение на 3 массива чисто синтаксическое - просто первый применяется дальше
const primitiveTypes = {
    // Массив (объект) для провекри однозначных типов
    Boolean: true,
    String: 'whoo',
    Function: () => {},
    Undefined: undefined,
    Bigint: BigInt(1),
};

const standartTypes = Object.assign({}, primitiveTypes, {
    // Стандартные типы (включают однозначные)
    Number: 123,
    Object: {},
    'Array/Object': [],
    'Null/Object': null,
});

const realTypes = Object.assign({}, primitiveTypes, {
    // Фактические типы (включают однозначные, но не все стандартные)
    Null: null,
    Number: 123,
    NaN: 'a' / 2,
    Infinity: 1 / 0,
    Array: [],
    Object: {},
    Date: new Date(),
    Regexp: /ab+c/,
    Set: new Set([1, 1, 2]),
    Map: new Map(),
});

// Test utils

const testBlock = (name) => {
    console.groupEnd();
    console.group(`# ${name}\n`);
};

const getRealType = (value) => {
    // Return string with a “real” type of value.
    // For example:
    //     typeof new Date()       // 'object'
    //     getRealType(new Date()) // 'date'
    //     typeof NaN              // 'number'
    //     getRealType(NaN)        // 'NaN'
    // Use typeof, instanceof and some magic. It's enough to have
    // 12-13 unique types but you can find out in JS even more :)
    let realType = typeof value;
    if (realType in primitiveTypes) {
        // Если тип однозначный то сразу вернём
        return realType;
    }
    if (realType === 'number') {
        // Для NaN и Infinity отдельный котёл, здесь с маленькой буквы number - это правильно
        if (isNaN(value)) {
            return 'NaN';
        }
        if (value > Number.MAX_VALUE) {
            return 'Infinity';
        }
    }
    realType = {}.toString.call(value).slice(8, -1).toLowerCase(); // Секретная функция https://learn.javascript.ru/class-instanceof
    return realType.charAt(0).toUpperCase() + realType.slice(1); // Первую букву - большой
};

const areEqual = (a, b) => {
    const typea = getRealType(a);
    const typeb = getRealType(b);
    if (typea === 'Array' && typeb === 'Array') {
        // Если оба элемента массива то сравниваем поэлементно
        for (const key in a) {
            if (!areEqual(a[key], b[key])) {
                // Рекурсия для многомерности
                return false;
            }
        }
        return true;
    }
    return a === b;
    // Compare arrays of primitives
    // Remember: [] !== []
};

const test = (whatWeTest, actualResult, expectedResult) => {
    if (areEqual(actualResult, expectedResult)) {
        console.log(`[OK] ${whatWeTest}\n`);
    } else {
        console.error(`[FAIL] ${whatWeTest}`);
        console.debug('Expected:');
        console.debug(expectedResult);
        console.debug('Actual:');
        console.debug(actualResult);
        console.log('');
    }
};

// Functions

const getType = (value) => {
    // Return string with a native JS type of value
    const type = typeof value;
    return type.charAt(0).toUpperCase() + type.slice(1); // Первую букву - большой
};

const getTypesOfItems = (arr) => {
    // Return array with types of items of given array
    const ret = [];
    for (const key in arr) {
        ret[key] = getType(arr[key]);
    }
    return ret;
};

const countRealTypes = (arr) => {
    // Return an array of arrays with a type and count of items
    // with this type in the input array, sorted by type.
    // Like an Object.entries() result: [['boolean', 3], ['string', 5]]
    const ret = [];
    for (const key in arr) {
        const type = getRealType(arr[key]);
        ret[type] = type in ret ? ret[type] + 1 : 1;
    }
    const ret2 = [];
    for (const key in realTypes) {
        // Эта фиговина сортирует по типу (перебираем массив всех сначала)
        if (ret[key]) {
            ret2.push([key, ret[key]]);
        }
    }
    return ret2;
};

const allItemsHaveTheSameType = (arr) => {
    // Return true if all items of array have the same type
    const types = countRealTypes(arr);
    if (types.length === 1) {
        // Типов 1 штука, значит совпало
        return true;
    }
    if (types.length > 1) {
        // Типов несколько - значит разные
        return false;
    }
    return null; // Типов вообще нету (фигня какая-то на входе)
};

const getRealTypesOfItems = (arr) => {
    // Return array with real types of items of given array
    const ret = [];
    for (const key in arr) {
        ret[key] = getRealType(arr[key]);
    }
    return ret;
};

const everyItemHasAUniqueRealType = (arr) => {
    // Return true if there are no items in array
    // with the same real type
    return countRealTypes(arr).length === arr.length;
};

function arrayFnIteration(arr, fn) {
    // Функция проверки всех типов
    //  Массив параметров
    for (const key in arr) {
        // Я знаю что эта запись не совсем корректна и совсем не в функциональном стиле
        const params = key.split('/'); // разбиваем ключ на пару
        test(params[0][0].toUpperCase() + params[0].slice(1), fn(arr[key]), params[1] ? params[1] : params[0]);
    }
}

// Tests

testBlock('getType');
// Тестируем встроенные типы
arrayFnIteration(standartTypes, getType);

testBlock('getRealType'); //  Тестируем расширенные типы
arrayFnIteration(realTypes, getRealType);

testBlock('allItemsHaveTheSameType');

test('All values are numbers', allItemsHaveTheSameType([11, 12, 13]), true);

test('All values are strings', allItemsHaveTheSameType(['11', '12', '13']), true);

test(
    'All values are strings but wait',
    allItemsHaveTheSameType(['11', new String('12'), '13']),
    true // What the result?
);

test(
    'Values like a number',
    allItemsHaveTheSameType([123, 123 / 'a', 1 / 0]),
    false // What the result?
);

test(
    'Values like an object',
    allItemsHaveTheSameType([
        {},
        // , Add as many as possible
    ]),
    true
);

testBlock('getTypesOfItems VS getRealTypesOfItems');

let knownTypes = [
    // Я не понял как коротко переопределять константу, поэтому сделал переменной
    // Add values of different types like boolean, object, date, NaN and so on
];

knownTypes = Object.values(primitiveTypes);
let knownTypesNames = Object.keys(primitiveTypes);

test('Check basic types', getTypesOfItems(knownTypes), knownTypesNames);

knownTypes = Object.values(realTypes);
knownTypesNames = Object.keys(realTypes);

test('Check real types', getRealTypesOfItems(knownTypes), knownTypesNames);

testBlock('everyItemHasAUniqueRealType');

test('All value types in the array are unique', everyItemHasAUniqueRealType([true, 123, '123']), true);

test('Two values have the same type', everyItemHasAUniqueRealType([true, 123, '123' === 123]), false);

test('There are no repeated types in knownTypes', everyItemHasAUniqueRealType(knownTypes), true);

testBlock('countRealTypes');

// В этой функции с последовательностью фигово: в реальной жизни порядок может поменятся
// рекомендуется через объекты-массивы задавать такую фигню, например:
// { 'boolean':3,'null':1,'object':1 }
// или через мапу, но мапа слишком многословная
test('Count unique types of array items', countRealTypes([true, null, !null, !!null, {}]), [
    ['Boolean', 3],
    ['Null', 1],
    ['Object', 1],
]);

// А здесь случай наступил, о котором выше догадался.
test('Counted unique types are sorted', countRealTypes([{}, null, true, !null, !!null]), [
    ['Boolean', 3],
    ['Null', 1],
    ['Object', 1],
]);

// Add several positive and negative tests

test('Проверяем кол-во специфических типов', countRealTypes([new Map(), {}, new Map(), new Set([1, 2, 3]), {}]), [
    ['Object', 2],
    ['Set', 1],
    ['Map', 2],
]);
