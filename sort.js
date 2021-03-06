function roundedUp(i) {
    return (i+0.5)|0;
}

function roundedDown(i) {
    return (i-0.5)|0;
}

function swap(arr, i, j) {
    if (i != j) {
        arr[i] = arr[i] ^ arr[j];
        arr[j] = arr[j] ^ arr[i];
        arr[i] = arr[i] ^ arr[j];
    }
}

function stepDiff(current, previous) {
    // diff should have the following:
    // * array of new values in certain indexes
    // * whether that step is focused or not
    var diff = { 'changes': new Array() };

    // check for new values
    for (var i=0; i<current.values.length; i++) {
        if (current.values[i] != previous.values[i]) {
            diff.changes.push({'index': i, 'value': current.values[i]});
        }
    }

    // check if new focused value
    if ('focused' in current)
        diff.focused = current.focused;
    return diff;
}

function nextStep(current, next) {
    for (var i=0; i<next.changes.length; i++) {
        current.values[next.changes[i].index] = next.changes[i].value;
    }
    if ('focused' in next)
        current.focused = next.focused;
    else if ('focused' in current)
        delete current.focused;
}

function arrayToForm(array,paramName) {
    var result = "";
    for (var i=0; i<array.length; i++) {
        result += paramName + "=" + array[i];
        if (i < array.length-1)
            result += "&";
    }

    return result;
}

function cleanFrames(frames) {
    var n = frames.steps.length;
    for (var i=0; i<n-1; i++) {
        //console.log(frames.steps);
        if (frames.steps[i].changes.length == 0 && !('focused' in frames.steps[i])) {
            frames.steps.splice(i, 1);
            //i = 0;
            n--;
        }
    }
}

function selectionSort(arrayInput) {
    var frames = {};
    frames.initial = arrayInput.slice(0);
    frames.steps = new Array();
    var previous = {'values': frames.initial.slice(0)};

    var n = arrayInput.length;
    for (var j=0; j<n-1; j++) {
        var iMin = j;
        for (var i = j+1; i<n; i++) {
            frames.steps.push(stepDiff({'values': arrayInput.slice(0), 'focused': i}, previous));

            if (arrayInput[i] < arrayInput[iMin]) {
                iMin = i;
            }
        }
        if (iMin != j) {
            swap(arrayInput, iMin, j);
            frames.steps.push(stepDiff({'values': arrayInput.slice(0)}, previous));
            previous.values = arrayInput.slice(0);
        }
    }

    frames.steps.push(stepDiff({'values': arrayInput.slice(0)}, previous));
    return frames;
}

function insertionSort(arrayInput) {
    var frames = {};
    frames.initial = arrayInput.slice(0);
    frames.steps = new Array();
    var previous = frames.initial.slice(0);

    frames.steps.push(stepDiff({'values': arrayInput.slice(0)}, {'values': previous.slice(0)}));
    previous = arrayInput.slice(0);
    for (var i=0; i<arrayInput.length; i++) {
        var key = arrayInput[i];
        var j = i - 1;
        while (j >= 0 && arrayInput[j] > key) {
            frames.steps.push(stepDiff({'values': arrayInput.slice(0), 'focused': j}, {'values': previous.slice(0)}));
            previous = arrayInput.slice(0);

            arrayInput[j+1] = arrayInput[j];
            j = j-1;
            frames.steps.push(stepDiff({'values': arrayInput.slice(0)}, {'values': previous.slice(0)}));
            previous = arrayInput.slice(0);
        }
        arrayInput[j+1] = key;
        frames.steps.push(stepDiff({'values': arrayInput.slice(0)}, {'values': previous.slice(0)}));
        previous = arrayInput.slice(0);
    }
    frames.steps.push(stepDiff({'values': arrayInput.slice(0)}, {'values': previous.slice(0)}));
    return frames;
}

function merge(arr, l, m, r, frames, previous) {
    var n1 = m - l + 1;
    var n2 = r - m;

    var L = new Array();
    var R = new Array();
    for (var i = 0; i < n1; i++)
        L.push(arr[l + i]);
    for (var j = 0; j < n2; j++)
        R.push(arr[m + 1 + j]);

    var i = 0;
    var j = 0;
    var k = l;

    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        }
        else {
            arr[k] = R[j];
            j++;
        }
        frames.steps.push(stepDiff({'values': arr.slice(0), 'focused': k}, previous));
        previous.values = arr.slice(0);
        k++;
        frames.steps.push(stepDiff({'values': arr.slice(0)}, previous));
        //previous.values = arr.slice(0);
    }

    while (i < n1) {
        arr[k] = L[i];
        frames.steps.push(stepDiff({'values': arr.slice(0)}, previous));
        previous.values = arr.slice(0);
        i++;
        k++;
    }

    while (j < n2) {
        arr[k] = R[j];
        frames.steps.push(stepDiff({'values': arr.slice(0)}, previous));
        previous.values = arr.slice(0);
        j++;
        k++;
    }
    //steps.push({'values': arr.slice(0)});
    //cleanFrames(frames);
    return frames;
}

function min(x,y) {
    return (x < y) ? x : y;
}

function mergeSort(arr, l, r, frames, previous) {
    // default parameters
    if (l==null) {l = 0;}

    if (r == null && frames == null) {
        r = arr.length-1;
    }
    if (frames == null) {
        frames = {};
        frames.initial = arr.slice(0);
        frames.steps = new Array();
        previous = {'values': arr.slice(0)};
    }

    if (l < r) {
        var m = Math.floor(l + (r-l)/2);
        mergeSort(arr, l, m, frames, previous);
        mergeSort(arr, m+1, r, frames, previous);
        merge(arr, l, m, r, frames, previous);
    }
    //cleanFrames(frames);
    return frames;
}

function partition(arr, l, h, frames, previous) {
    var x = arr[h];
    var i = l - 1;

    for (var j=l; j <= h-1; j++) {
        frames.steps.push(stepDiff({'values': arr.slice(0), 'focused': j}, previous));
        if (arr[j] <= x) {
            i++;

            swap(arr, i, j);
            frames.steps.push(stepDiff({'values': arr.slice(0)}, previous));
            previous.values = arr.slice(0);
        }
    }

    swap(arr, i+1, h);
    frames.steps.push(stepDiff({'values': arr.slice(0)}, previous));
    previous.values = arr.slice(0);
    return (i+1);
}

function quickSort(arr, l, h, frames, previous) {
    // default parameters
    if (l==null) {l=0;}

    if (h == null && frames == null) {
        h = arr.length-1;
    }
    if (frames == null) {
        frames = {};
        frames.initial = arr.slice(0);
        frames.steps = new Array();
        previous = {'values': arr.slice(0)};
    }

    if (l < h) {
        var p = partition(arr, l, h, frames, previous);
        quickSort(arr, l, p - 1, frames, previous);
        quickSort(arr, p + 1, h, frames, previous);
    }
    return frames;
}

function bubbleSort(arr) {
    var frames = {};
    frames.steps = new Array();
    frames.initial = arr.slice(0);
    var previous = {'values': arr.slice(0)};

    for (var i=0; i<arr.length-1; i++) {
        for (var j=0; j<arr.length-i-1; j++) {
            frames.steps.push(stepDiff({'values': arr.slice(0), 'focused': j}, previous));
            if (arr[j] > arr[j+1]) {
                // swap
                swap(arr, j, j+1);
                frames.steps.push(stepDiff({'values': arr.slice(0)}, previous));
                previous.values = arr.slice(0);
            }
        }
    }
    frames.steps.push(stepDiff({'values': arr.slice(0)}, previous));
    return frames;
}

function countingSort(arr) {
    var frames = {};
    frames.steps = new Array();
    frames.intial = arr.slice(0);
    var previous = {'values': arr.slice(0)};

    var output = new Array(arr.length);
    var count = Array.apply(null, Array(arr.length-1)).map(Number.prototype.valueOf,0);

    for (var i=0; i < arr.length; i++) {
        count[arr[i]]++;
    }

    for (var i=1; i<=arr.length; i++) {
        count[i] += count[i-1];
        frames.steps.push(stepDiff({'values': count.slice(0)}, previous));
        previous.values = count.slice(0);
    }

    for (var i=0; i < arr.length; i++) {
        output[count[arr[i]]-1] = arr[i];
        --count[arr[i]];
        frames.steps.push({'values': output.slice(0)});
    }

    for (var i=0; i<arr.length; i++) {
        arr[i] = output[i];
    }

    return frames;
}

function shellSort(arr) {
    var frames = {};
    frames.initial = arr.slice(0);
    frames.steps = new Array();
    var previous = {'values': arr.slice(0)};
    var n = arr.length;
    for (var gap=n >> 1; gap > 0; gap = gap >> 1) {
        for (var i = gap; i < n; i++) {
            var temp = arr[i];

            var j;
            for (j=i; j >= gap && arr[j-gap] > temp; j -= gap) {
                frames.steps.push(stepDiff({'values': arr.slice(0), 'focused': i-gap}, previous));
                arr[j] = arr[j - gap];
                frames.steps.push(stepDiff({'values': arr.slice(0)}, previous));
                previous.values = arr.slice(0);
            }

            arr[j] = temp;
            frames.steps.push(stepDiff({'values': arr.slice(0)}, previous));

            previous.values = arr.slice(0);
        }
    }
    frames.steps.push(stepDiff({'values': arr.slice(0)}, previous));
    return frames;
}


function heapify(arr, n, i, frames, previous) {
    var largest = i;
    var l = 2*i + 1;
    var r = 2*i + 2;

    frames.steps.push(stepDiff({'values': arr.slice(0), 'focused': l}, previous));
    if (l < n && arr[l] > arr[largest]) {
        largest = l;
    }

    frames.steps.push(stepDiff({'values': arr.slice(0), 'focused': r}, previous));
    if (r < n && arr[r] > arr[largest]) {
        largest = r;
    }

    if (largest != i) {
        swap(arr, i, largest);
        frames.steps.push(stepDiff({'values': arr.slice(0)}, previous));
        previous.values = arr.slice(0);
        heapify(arr, n, largest, frames, previous);
    }


}

function heapSort(arr) {
    var frames = {};
    frames.initial = arr.slice(0);
    frames.steps = new Array();
    var previous = {'values': arr.slice(0)};


    var n = arr.length;
    for (var i=roundedDown(n/2) - 1; i >= 0; i--) {
        heapify(arr, n, i, frames, previous);
    }

    for (var i=n-1; i>=0; i--) {
        swap(arr, 0, i);
        frames.steps.push(stepDiff({'values': arr.slice(0)}, previous));
        previous.values = arr.slice(0);

        heapify(arr, i, 0, frames, previous);
    }

    frames.steps.push(stepDiff({'values': arr.slice(0)}, previous));

    return frames;
}
