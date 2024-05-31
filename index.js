var box = document.querySelector('.turntable-box')
var canvas = document.querySelector('#myCanvas')
var canvas1 = document.querySelector('#ponitr-canvas')

var canvasSize = canvas.offsetWidth
canvas.width = canvasSize
canvas.height = canvasSize
canvas1.width = canvasSize
canvas1.height = canvasSize

var ctx = canvas.getContext("2d");
var ctx1 = canvas1.getContext("2d");

// 圆盘绘制
ctx.beginPath()
ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2, false)
ctx.closePath()


var surplus = allAngle = Math.PI * 2, average = Number((allAngle / (jsonData.foodList.length)).toFixed(5))
var countNum = 0

// 中奖项绘制
// 固定最高等级大小
jsonData.foodList.forEach((item, i) => {
    if (item.level !== 1) {
        item.average = Number((average / item.level).toFixed(5))
        surplus -= item.average
        countNum++
    }
})

var surplusAverage = Number((surplus / (jsonData.foodList.length - countNum)).toFixed(5))
jsonData.foodList.forEach((item, i) => {
    if (item.level == 1) {
        countNum++
        if (countNum == jsonData.foodList.length) {
            item.average = surplus
        } else {
            item.average = surplusAverage
            surplus -= item.average
        }
    }
})

var last = 0, surplusAngle = 360, lastAngle = 0
jsonData.foodList.forEach((item, i) => {
    var val = last + item.average > Math.PI * 2 ? Math.PI * 2 : last + item.average

    ctx.beginPath()
    ctx.fillStyle = item.color
    ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, last, val, false)
    ctx.lineTo(canvasSize / 2, canvasSize / 2);
    ctx.fill()
    ctx.closePath()

    // 绘制文本  
    let textAngle = Number(((360 / (Math.PI * 2)) * item.average).toFixed(5)); // 文本位于圆盘的deg
    surplusAngle -= textAngle
    item.textAngle = lastAngle + textAngle
    if (i == jsonData.foodList.length - 1) {
        item.textAngle = 360
    }
    item.angleBoundary = [lastAngle, item.textAngle]
    lastAngle = item.textAngle

    var textAngle1 = item.angleBoundary[0] + (item.angleBoundary[1] - item.angleBoundary[0]) / 2

    var textX = canvasSize / 2 + Math.cos(textAngle1 * Math.PI / 180) * (canvasSize / 2 - 30);//x轴上的坐标值,基于圆的半径和指定的角度Angle 
    var textY = canvasSize / 2 + Math.sin(textAngle1 * Math.PI / 180) * (canvasSize / 2 - 30);//y轴上的坐标值,基于圆的半径和指定的角度Angle 

    ctx.save();//保存当前的Canvas状态，以便之后可以恢复它
    ctx.translate(textX, textY);// 将Canvas的原点移动到(textX, textY)位置，这样后续的绘制操作都将基于这个新的原点  
    ctx.rotate(textAngle1 * Math.PI / 180);// 旋转Canvas，使得文本能够沿着指定的textAngle方向排列  
    ctx.textAlign = 'center';// 设置文本的对齐方式为居中，这样文本会在当前位置的中心点绘制 
    ctx.textBaseline = 'middle';// 设置文本的基线为中间，确保文本垂直居中  
    ctx.fillStyle = '#fff';// 设置文本填充颜色为白色
    ctx.font = "12px Arial";
    ctx.fillText(jsonData.foodList[i].label, 0, 0);
    ctx.restore();

    last += item.average
})

// 指针
ctx1.beginPath()
ctx1.fillStyle = '#383838'
ctx1.moveTo(canvasSize / 2, canvasSize / 2 - 30);
ctx1.lineTo(canvasSize / 2 - 10, canvasSize / 2)
ctx1.quadraticCurveTo(canvasSize / 2, canvasSize / 2 + 20, canvasSize / 2 + 10, canvasSize / 2);
ctx1.fill()
ctx1.closePath()

var tipBox = document.querySelector('.tip-box')
var tipBoxFood = tipBox.querySelector('.text')
var tipBoxFoodRmk = tipBox.querySelector('.rmk')

// 随机数
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
// 固定滚动圈数动画
function scrollAni(angle, time = 4, item) {
    var allTime = 1
    canvas1.style.transform = `rotate(${allTime * 360}deg)`
    var timer = setInterval(() => {
        if (allTime == time) {
            clearInterval(timer)
            scrollAniCustomization(angle, item)
        } else {
            allTime++
            canvas1.style.transform = `rotate(${allTime * 360}deg)`
        }
    }, 500);
}
function clearCanvasState() {
    return new Promise((res) => {
        canvas1.style['transition-duration'] = '0s'
        canvas1.style.transform = 'rotate(0deg)'
        setTimeout(() => {
            canvas1.style['transition-duration'] = '0.5s'
            res()
        }, 100);
    })
}

function scrollAniCustomization(angle, item) {
    const pattern = /\d+/g;
    var matches = canvas1.style.transform.match(pattern)
    matches = Number(matches[0])
    canvas1.style.transform = `rotate(${matches + angle}deg)`
    setTimeout(() => {
        console.log(angle, item);
        tipBox.style.display = 'flex'
        tipBoxFood.innerHTML = item.label + '!'
        tipBoxFoodRmk.innerHTML = item.rmk
        var imgs = Array.from(tipBox.querySelectorAll('.img'))
        var closeBtn = tipBox.querySelector('.close')

        imgs.forEach(img=>{
            if(img.className.includes(item.img)){
                img.style.display = 'block'
            }else{
                img.style.display = 'none'
            }
        })
        closeBtn.onclick = () => {
            tipBox.style.display = 'none'
        }

    }, 500);
}

var btn = document.querySelector('.btn')
btn.onclick = async function () {
    await clearCanvasState()
    var angle = Number(getRandomArbitrary(0, 360).toFixed(1))
    jsonData.foodList.forEach((item) => {
        if (angle >= item.angleBoundary[0] && angle <= item.angleBoundary[1]) {
            scrollAni(angle, 4, item)
        }
    })
}
console.log(jsonData.foodList);