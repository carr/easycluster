module Stats
  # TODO spec za ovo
  def generate_stats
    stats_filename = File.join(@root, "stats_#{Time.now.strftime('%Y-%m-%d_%H-%M')}.txt")
    
    File.open(stats_filename, "w") do |f|
      f.puts "Finished #{all_jobs.size} jobs"
      f.puts "Time started: #{time_started}"
      f.puts "Time finished: #{time_finished}"
      f.puts "Duration: #{duration} ms (#{duration/1000} sec) [#{duration/1000/60} min]"
      f.puts "A total of #{@jobs_timed_out_count} jobs timed out"      
      f.puts log_spacer
      
      total_processing_time = 0
      total_client_processing_time = 0
      total_communication = 0
      f.puts "\t\tClient name\t\tJob filename\t\tJob duration\t\tClient processing time"
      @job_assignments_finished.each_with_index do |assignment, index|
        values = [index+1, assignment.client.name.ljust(10), assignment.job.filename, assignment.duration, assignment.client_processing_time]
        f.puts "%s.\t\t%s\t\t%s\t\t%sms\t\t%sms" % values
        total_processing_time += assignment.duration
        total_client_processing_time += assignment.client_processing_time
        total_communication += assignment.duration - assignment.client_processing_time
      end

      f.puts log_spacer      
      f.puts "Total processing time #{total_processing_time}ms (#{total_processing_time/1000}sec)"
      f.puts "Total client processing time #{total_client_processing_time}ms (#{total_client_processing_time/1000}sec)"
      f.puts "Total communication time #{total_communication}ms (#{total_communication/1000}sec)"
      f.puts "Communication is #{percentilize(total_communication, total_processing_time)}% of total time"
      f.puts "Average duration is #{total_processing_time / all_jobs.size}"      
      f.puts log_spacer
      
      f.puts "Total clients: %s" % @clients.size
      f.puts log_spacer      
      @clients.each do |client|
        assignments = find_finished_assignments_for_client(client.name)
        f.puts "Client: #{client.name}"
        f.puts "Ip: #{client.ip}"
        f.puts "User agent: #{client.user_agent[0, 10]}"
        f.puts "Total jobs processed: #{assignments.size}/#{all_jobs.size} (#{percentilize(assignments.size, all_jobs.size)}%)"
        f.puts log_spacer
      end
    end
    
    stats_filename
  end    
  
  def percentilize(numerator, denominator)
    round( (numerator.to_f / denominator)*100 , 2)
  end
  
  def round(float, num_of_decimal_places)
      exponent = num_of_decimal_places # + 2
      num = float*(10**exponent)
      num = num.round
      num = num / (10.0**exponent)
  end 
  
  
  def log_spacer
    "====================="    
  end  
end
