class Md5Action
  def self.go(session, request, params)
    if work.has_jobs_waiting?
      map(session, request, params)
    else
      if work.is_finished?
        done
      else
        done
      end
    end
  end
end

