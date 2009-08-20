require 'boot'

job_name = 'compress/job.xls'
DRb.start_service 'druby://:9000', Workload.new(job_name)
puts "Server running at #{DRb.uri}"

trap("INT") { DRb.stop_service }
DRb.thread.join
