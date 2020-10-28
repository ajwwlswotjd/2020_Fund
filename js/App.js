const { log , dir } = console;


class App {
    constructor(){

        this.num;
        this.conv_now = 2;
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
        $("#form_total").on("input" , this.totalInputEventHandler );
        $("#form_submit_btn").on("click", this.fundRegisterBtnClickEventHandler );

    }

    fundRegisterBtnClickEventHandler = e => {
        let name = form_name.value;
        let date = form_date.value;
        let total = form_total.value.split(",").join('')*1;
        
        if( name.trim() === "" || date.trim() === "" || total <= 0 ){
            alert("누락된 항목이 있습니다.");
            return;
        }
        let endDate = new Date( date ).toString();
        let fund =  { number : this.num, name , endDate , total , current : 0 };
        this.datas.push( fund );
        alert("펀드 등록이 완료되었습니다.");
        this.drawForm();
    }

    totalInputEventHandler = e => {
        let value = e.currentTarget.value;
        value = (value.replaceAll(/[^0-9]/g,"")*1).toLocaleString();
        e.currentTarget.value = value;
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
            this.conv_now = nextIdx;
        });
        this.fxArr[nextIdx].bind(this)();
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
            let percent = olim( fund.current / fund.total * 100 );
            let tr = document.createElement("tr");
            tr.innerHTML =
            `
            <td title="${ xss(fund.number) }" class="fowe-2">${ xss(fund.number) }</td>
            <td title="${ xss(fund.name) }" class="fowe-2">${ xss(fund.name) }</td>
            <td title="${ fund.total.toLocaleString() }원" class="fowe-2">${ fund.total.toLocaleString() }원</td>
            <td title="${ new Date(fund.endDate).toMyString() }" class="fowe-2">${ new Date(fund.endDate).toMyString() }</td>
            <td class="fowe-2">
                <div class="main_progress">
                    <div class="main_progress_inner gd-r-b">${ percent }%</div>
                </div>
            </td>`;
            log(tr);
            $tbody.append(tr);
            $(tr).find(".main_progress_inner").animate({ width : percent + "%"},1500);
        });
        
        
    }

    drawForm(){
        // 펀드등록
        this.num = this.getFundNum();
        $("#form_number").html(this.num);
        $(".fund_form input").val("");
    }

    drawFund(){
        // 펀드 보기
        
    }

    drawInvestor(){
        // 투자자 목록
    }

    render(){
        // log(this.datas);
    }

    async init(){
        this.datas = await this.readData();
        this.addEvent();
        this.render();
        // this.drawForm();
        this.drawFund();
    }

    getFundNum(){
        
        let f = ()=> String.fromCharCode( Math.floor(Math.random() * 26) + 65 );
        let n = (Math.floor(Math.random()*100)).toString().padStart(3,"0");
        return f() + f() + n;
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

Date.prototype.toJSONString = function(){
    return this.toISOString().split('.')[0].split("T").join(" ");
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

window.olim = function(num){
    return Math.ceil(num * 100) / 100;
}