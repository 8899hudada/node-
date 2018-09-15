const { should, expect, assert } = require('chai')

const {add, mul} = require('./math')

// should()

// add(2, 3).should.equal(5)

// assert.equal(add(2, 3), 5)

// expect(add(2, 3)).to.be.equal(5)

describe('#math', () => {
    describe('add', () => {
        it('5555', () => {
            expect(add(2, 3), 5)
        })

        it('-1111111', () => {
            expect(add(2, -3), -2)
        })
    })

    describe('mul', () => {
        it('100000', () => {
            expect(mul(2, 5), 10)
        })
    })
})
