var Twitter = require('twitter');
var jsdom = require("jsdom/lib/old-api");
var http = require('http');
var fs = require("fs");
var pagination = require('pagination');
var token = require('./token');

var html;
var tempTweet;


//Function to generate paginator
var boostrapPaginator = new pagination.TemplatePaginator({
    prelink:'/', current: 3, rowsPerPage: 5,
    totalResult: 10020, slashSeparator: true,
    template: function(result) {
        var i, len, prelink;
         html = '<div><ul class="pagination">';
        if(result.pageCount < 2) {
            html += '</ul></div>';
            return html;
        }
        prelink = this.preparePreLink(result.prelink);
        if(result.previous) {
            html += '<li><a href="' + prelink + result.previous + '">' + this.options.translator('PREVIOUS') + '</a></li>';
        }
        if(result.range.length) {
            for( i = 0, len = result.range.length; i < len; i++) {
                if(result.range[i] === result.current) {
                    html += '<li class="active"><a href="' + prelink + result.range[i] + '">' + result.range[i] + '</a></li>';
                } else {
                    html += '<li><a href="' + prelink + result.range[i] + '">' + result.range[i] + '</a></li>';
                }
            }
        }
        if(result.next) {
            html += '<li><a href="' + prelink + result.next + '" class="paginator-next">' + this.options.translator('NEXT') + '</a></li>';
        }
        html += '</ul></div>';
        return html;
    }
});
console.log(boostrapPaginator.render());


//Authencticating user
var client = new Twitter(token);


//Defining parameters
var params = { count: 5};
client.get('statuses/home_timeline', params, function(error, tweets, response) {
    tempTweet = tweets;
    if (!error) {
        console.log(tweets);
    }
}); 


//Laumching the node server and appending the twitter feed to myapp
http.createServer(function(request,response) {
    var page_template = fs.readFileSync('index.html','utf-8');
    jsdom.env("", ["http://code.jquery.com/jquery.min.js"], function(err, window) {
        var $ = window.$;
        window.$('html').html(page_template);
        window.$('h2').html("Content Added to DOM by Node.js Server");

        $.each(tempTweet, function (i, item) {
            console.log(item.text + "\n");
            var names = item.user.name;
            var result = names.link(item.user.url);
            var glyphicons = "<span class='glyphicon glyphicon-comment'></span><span class='glyphicon glyphicon-retweet'>&nbsp;" + item.retweet_count + 
            "</span><span class='glyphicon glyphicon-heart-empty'>&nbsp;"+ item.favorite_count+"</span><span class='glyphicon glyphicon-envelope'></span>";
            $("#tweetFeed").
            append("<div class='parent'><div class='name'>" + result + "</div><p class='tweetText'>" + item.text + "</p><div>" + glyphicons + "</div></div>");
        })

        $("#pagination").append(html);
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end("<!DOCTYPE html>\n" + window.$('html').html());
    });

}).listen(8000);
