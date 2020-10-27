const { log , dir } = console;


class App {
    constructor(){

        this.conv_now = 0;
        this.datas;
        this.investorList = [];
        this.fxArr = [ this.drawMain , this.drawForm , this.drawFund , this.drawInvestor ];
        this.txtArr = [ '메인페이지' , '펀드등록' , '펀드보기' , '투자자목록' ];
        this.$links = $("nav > li");
        this.$pages = $("#pages > .page");
        this.isMoving = false;


        this.init();
    }

    readData(){
        return $.getJSON("./js/fund.json");
    }

    addEvent(){
        
        $("nav > li").on("click", this.navClickEventHandler );

    }

    navClickEventHandler = e => {

        if(this.isMoving) return;
        let idx = e.currentTarget.dataset.idx * 1;
        if(idx === this.conv_now) return;
        this.$links.eq(this.conv_now).removeClass("nav_now");
        this.$links.eq(idx).addClass("nav_now");
        this.convertPageAndDraw( this.conv_now , idx );
    }

    convertPageAndDraw(preIdx , nextIdx){
        
        this.isMoving = true;
        let dir = preIdx > nextIdx;
        // dir 이 true 이면 올리는 애니메이션, false 면 내리는 애니메이션

        let preTarget = dir ? '100%' : '-100%';
        let nextTarget = dir ? '-100%' : '100%';
        this.$pages.eq(preIdx).animate({ top : preTarget } , 1000);
        $(".page_title").html(this.txtArr[nextIdx]);
        this.$pages.eq(nextIdx).css({ top : nextTarget }).animate({ top : 0 }, 1000 , ()=>{
            this.isMoving = false;
            this.fxArr[nextIdx].bind(this)();
            this.conv_now = nextIdx;
        });

    }

    drawMain(){
        // 메인페이지
        let fundTotal = sum( ...this.datas.map(x=> x.total) ).toLocaleString();
        let ivTotal = sum( ...this.datas.map(x=> x.current) ).toLocaleString();
        let recIv = this.investorList[this.investorList.length-1];
        let recWon = (recIv ? recIv.money : 0).toLocaleString();
        let recPercent = recIv ? recIv.percent : 0;

        $("#main_fund_total").html( fundTotal + "원" );
        $('#main_invest_total').html( ivTotal + "원" );
        $("#main_invest_recent").html(recWon + "원");
        $("#main_invest_recent_txt > span").html(recPercent * 100);
        // log(fundTotal);

        let $tbody = $(".main_table tbody");
        $tbody.empty();
        let list = this.datas
        .map(x=>{
            x.percent = x.current/x.total;
            return x;
        })
        .filter(x=>{
            return new Date(x.endDate) > new Date();
        })
        .sort((a,b)=> b.percent - a.percent)
        .slice(0,4)
        .forEach(fund => {
            let tr = document.createElement("tr");
            tr.innerHTML =
            `<td class="fowe-2">${ fund.number }</td>
            <td class="fowe-2">${ fund.name }</td>
            <td class="fowe-2">${ fund.total.toLocaleString() }원</td>
            <td class="fowe-2">${ new Date(fund.endDate).toMyString() }</td>
            <td class="fowe-2">
                <div class="main_progress">
                    <div class="main_progress_inner gd-r-b">100%</div>
                </div>
            </td>`;
            log(tr);
        });
        
        
    }

    drawForm(){
        // 펀드등록
    }

    drawFund(){
        // 펀드 보기
    }

    drawInvestor(){
        // 투자자 목록
    }

    render(){
        log(this.datas);
    }

    async init(){
        this.datas = await this.readData();
        this.addEvent();
        this.render();
        this.drawMain();
    }
}

window.addEventListener("load",(e)=>{
    window.app = new App();
});


window.sum = function(){
    let sum = 0;
    Array.from(arguments).forEach(x=> sum += x*1);
    return sum;
}


Date.prototype.toMyString = function(){
    return `${this.getFullYear()}년 ${this.getMonth()+1}월 ${this.getDate()}일 ${this.getHours()}시 ${this.getMinutes()}분 ${this.getSeconds()}초`;
}

window.xss = function(str){
    const items = [
        ["&","&amp;"],
        ["<","&lt;"],
        [">","&gt;"]
    ];
    items.forEach(x=>{
        str = str.replaceAll(x[0],x[1]);
    });
    return str;
}
