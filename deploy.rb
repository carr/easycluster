#!/usr/bin/env ruby
# simple deploy script

require "rubygems"
require "thor"
require "net/ssh"

class Deploy < Thor

	desc "deploy", "Easycluster deploy script"

	def push

		deploy_ip 				= 'iss.infinum.hr'
		deploy_user 			= 'www-data'
		deploy_port 			= '22'
		deploy_path				= '/var/www/s/svn.funja.org'

		Net::SSH.start("#{deploy_ip}", "#{deploy_user}", :port => "#{deploy_port}") do |ssh|
			ssh.exec! "mkdir -p #{deploy_path}"
			ssh.exec! "cd #{deploy_path}; git pull; touch tmp/restart.txt"
		end

		puts "================================"
		puts "       DEPLOY FINISHED!!!       "
		puts "================================"
	end
end

Deploy.start

