import { 
    MerkleHashLeftLeaf, 
    MerkleHashRightLeaf,
    MerkleHashRootLeftLeaf
} from '../bitvm/merkle-sequence.js'
import { PaulPlayer, VickyPlayer } from '../bitvm/bitvm-player.js'
import { LOG_TRACE_LEN, LOG_PATH_LEN } from '../bitvm/constants.js'
import { VM } from '../bitvm/vm.js'
import { program, data } from '../run/dummy-program.js'

const PAUL_SECRET = 'd898098e09898a0980989b980809809809f09809884324874302975287524398'
const VICKY_SECRET = 'a9bd8b8ade888ed12301b21318a3a73429232343587049870132987481723497'


class DummyVickyLeft extends VickyPlayer {
    constructor(){ 
        super(VICKY_SECRET, null, null)
    }

    nextTraceIndex(roundIndex){
        return [16, 8, 4, 2, 3][roundIndex]
    }
    
    nextMerkleIndex(roundIndex){
        return [16, 8, 4, 2, 3][roundIndex]
    }

    merkleChallenge(roundIndex){
        return Number(this.merkleIndex.toString(2).replace('0b','').padStart(5,'0')[roundIndex])
    }

    get traceIndex(){
        return 3
    }

    get merkleIndex(){
        return 0b00011
    }
}

class DummyVickyRight extends VickyPlayer {
    constructor(){ 
        super(VICKY_SECRET, null, null)
    }

    nextTraceIndex(roundIndex){
        return [0b10000, 0b01000, 0b00100, 0b00010, 0b00011][roundIndex]
    }
    
    nextMerkleIndex(roundIndex){
        return [0b10000, 0b11000, 0b11100, 0b11110, 0b11111][roundIndex]
    }

    merkleChallenge(roundIndex){
        return Number(this.merkleIndex.toString(2).replace('0b','').padStart(5,'0')[roundIndex])
    }

    get traceIndex(){
        return 0b00011
    }

    get merkleIndex(){
        return 0b11110
    }
}

class DummyVickyRootLeft extends VickyPlayer {
    constructor(){ 
        super(VICKY_SECRET, null, null)
    }

    get traceIndex(){
        return 3
    }

    nextTraceIndex(roundIndex){
        return [0b10000, 0b01000, 0b00100, 0b00010, 0b00011][roundIndex]
    }
    
    traceChallenge(roundIndex){
        return Number(this.traceIndex.toString(2).replace('0b','').padStart(LOG_TRACE_LEN,'0')[roundIndex])
    }

    get merkleIndex(){
        return 0b00000
    }

    nextMerkleIndex(roundIndex){
        return [0b10000, 0b01000, 0b00100, 0b00010, 0b00001][roundIndex]
    }

    merkleChallenge(roundIndex){
        return Number(this.merkleIndex.toString(2).replace('0b','').padStart(LOG_PATH_LEN,'0')[roundIndex])
    }

}


class DummyPaul extends PaulPlayer {
    constructor(vicky){
        const vm = new VM(program, data)
        super(PAUL_SECRET, vicky, vm)
    }
}


describe('MerkleHashLeaf', function() {

    it('can hash a left-hand side Merkle round', function(){
        const dummyVickyLeft = new DummyVickyLeft()
        const dummyPaulLeft = new DummyPaul(dummyVickyLeft)
        const dummyLeaf = new MerkleHashLeftLeaf({}, dummyVickyLeft, dummyPaulLeft, dummyVickyLeft.merkleIndex)
        
        const result = dummyLeaf.runScript()
        const finalStack = result.get('final_stack')
        expect(result.get('error')).toBe('')
        expect(finalStack[0]).toBe('01')
        expect(finalStack.length).toBe(1)
    })

    it('can hash a right-hand side Merkle round', function(){
        const dummyVickyRight = new DummyVickyRight()
        const dummyPaulRight = new DummyPaul(dummyVickyRight)
        const dummyLeaf = new MerkleHashRightLeaf({}, dummyVickyRight, dummyPaulRight, dummyVickyRight.merkleIndex)
        
        const result = dummyLeaf.runScript()
        const finalStack = result.get('final_stack')
        expect(finalStack[0]).toBe('01')
        expect(finalStack.length).toBe(1)
    })

    it('can hash a left-hand side Merkle root', function(){
        const dummyVickyLeft = new DummyVickyRootLeft()
        const dummyPaulLeft = new DummyPaul(dummyVickyLeft)
        const dummyLeaf = new MerkleHashRootLeftLeaf({}, dummyVickyLeft, dummyPaulLeft, dummyVickyLeft.traceIndex)
        
        const result = dummyLeaf.runScript()
        console.log(result)
        const finalStack = result.get('final_stack')
        expect(result.get('error')).toBe('')
        expect(finalStack[0]).toBe('01')
        expect(finalStack.length).toBe(1)
    })
})


