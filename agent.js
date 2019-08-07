// This file defines the agent who plays with the user
function getMatrix(numLine){
    var mat = new Array()
    for (var i = 0; i < numLine; ++i){
        mat[i] = new Array();
        for (var j = 0; j < numLine; ++j){
            mat[i][j] = 0;
        }
    }
    return mat;
}

class Measurement{
    constructor(r, c, opponentValue, myValue){
        this.r = r;
        this.c = c;
        this.opponentValue = opponentValue;
        this.myValue = myValue;
        if (myValue >= opponentValue){
            this.myBetter = true;
        }else{
            this.myBetter = false;
        }
    }
    getValue(){
        if (this.myBetter == true){
            return this.myValue;
        }else{
            return this.opponentValue;
        }
    }
}


class Agent{
    constructor(numLine, agentTurn, pointList, robot){
        // Two dimensional array to store the
        this.map = getMatrix(numLine); // agent uses 1. Player uses 2.
        this.agentTurn = agentTurn; // true means agent makes the next step
        this.pointList = pointList;
        this.robot = robot;
        this.numLine = numLine;
    }

    updatePointList(pointList){
        this.pointList = pointList;
    }

    checkWin(r, c){
        var noEmpty = true;
        for (var i = 0; i < this.numLine; ++i){
            for (var j = 0; j < this.numLine; ++j){
                if (this.map[i][j] == 0){
                    noEmpty = false;
                    break;
                }
            }
        }
        if (noEmpty == true){
            // draw
            return 0;
        }
        // (r, c) is the point that just be put the chess
        var value = this.map[r][c];
        var direction = [[-1, -1], [-1, 0], [-1, 1], [0, 1]];
        for (var d = 0; d < 4; ++d){
            var count = 1;
            for (var i = 1; i < 5; ++i){
                var tmpR = r + i * direction[d][0];
                var tmpC = c + i * direction[d][1];
                if (tmpR < 0 || tmpC < 0 || tmpR >= this.numLine || tmpC >= this.numLine){
                    // out of the region
                    break;
                }
                if (this.map[tmpR][tmpC] == value){
                    ++count;
                }else{
                    // not connected
                    break;
                }
            }
            for (var i = -1; i > -5; --i){
                var tmpR = r + i * direction[d][0];
                var tmpC = c + i * direction[d][1];
                if (tmpR < 0 || tmpC < 0 || tmpR >= this.numLine || tmpC >= this.numLine){
                    // out of the region
                    break;
                }
                if (this.map[tmpR][tmpC] == value){
                    ++count;
                }else{
                    // not connected
                    break;
                }
            }

            if (count >= 5){
                return 1;
            }
        }
        return -1;
    }

    getPosValue(r, c, v){
        var direction = [[-1, -1], [-1, 0], [-1, 1], [0, 1]];
        var value = 0;
        for (var d = 0; d < 4; ++d){
            var count = 0;
            var countMyChess = 0;
            for (var i = 1; i < 5; ++i){
                var tmpR = r + i * direction[d][0];
                var tmpC = c + i * direction[d][1];
                if (tmpR < 0 || tmpC < 0 || tmpR >= this.numLine || tmpC >= this.numLine){
                    // out of the region
                    break;
                }
                if (this.map[tmpR][tmpC] == v){
                    ++count;
                    ++countMyChess;
                }else if (this.map[tmpR][tmpC] == 0){
                    ++count;
                }else{
                    // cut by opponent
                    count -= 0.25;
                    break;
                }
            }
            for (var i = -1; i > -5; --i){
                var tmpR = r + i * direction[d][0];
                var tmpC = c + i * direction[d][1];
                if (tmpR < 0 || tmpC < 0 || tmpR >= this.numLine || tmpC >= this.numLine){
                    // out of the region
                    break;
                }
                if (this.map[tmpR][tmpC] == v){
                    ++count;
                    ++countMyChess;
                }else if (this.map[tmpR][tmpC] == 0){
                    ++count;
                }else{
                    // cut by opponent
                    count -= 0.25;
                    break;
                }
            }

            if (count >= 5){
                value += Math.pow(10, countMyChess);
            }
        }
        direction = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
        for (var d = 0; d < 8; ++d){
            var tmpR = r + direction[d][0];
            var tmpC = c + direction[d][1];
            if (tmpR < 0 || tmpC < 0 || tmpR >= this.numLine || tmpC >= this.numLine){
                // out of the region
                continue;
            }
            if (this.map[tmpR][tmpC] == v){
                // when the chess are together, the value will be higher
                ++value;
            }
        }
        return value;
    }

    chooseNextStep(){
        var candidate = [];
        for (var r = 0; r < this.numLine; ++r){
            for (var c = 0; c < this.numLine; ++c){
                if (this.map[r][c] == 0){
                    var myValue = this.getPosValue(r, c, 1);
                    var opponentValue = this.getPosValue(r, c, 2);
                    var measure = new Measurement(r, c, opponentValue, myValue);
                    candidate.push(measure);
                }
            }
        }
        // find the list of candidates with biggest value
        var bestCandidate = [];
        bestCandidate.push(candidate[0]);
        for (var i = 1; i < candidate.length; ++i){
            if (bestCandidate[0].getValue() < candidate[i].getValue()){
                bestCandidate = [];
                bestCandidate.push(candidate[i]);
            }else if (bestCandidate[0].getValue() == candidate[i].getValue()){
                bestCandidate.push(candidate[i]);
            }
        }
        // find the candidate with the biggest value of myValue
        var myBestCandidate = [];
        for (var i = 0; i < bestCandidate.length; ++i){
            if (bestCandidate[i].myBetter == true){
                myBestCandidate.push(bestCandidate[i]);
            }
        }
        var chooseR, chooseC;
        if (myBestCandidate.length > 0){
            var index = Math.floor(Math.random() * myBestCandidate.length);  // generate a int random number
            chooseR = myBestCandidate[index].r;
            chooseC = myBestCandidate[index].c;
        }else{
            var index = Math.floor(Math.random() * bestCandidate.length);  // generate a int random number
            chooseR = bestCandidate[index].r;
            chooseC = bestCandidate[index].c;
        }
        var chooseIndex = chooseR + chooseC * this.numLine; // column major
        this.robot.pickAndPlace(new THREE.Vector3(-400, 70, -100), this.pointList[chooseIndex].globalPos);
        this.map[chooseR][chooseC] = 1;
        return [chooseR, chooseC];
    }

}
