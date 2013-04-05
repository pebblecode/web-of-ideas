# encoding utf-8

require 'sinatra'
require 'sinatra/flash'
require 'sass'
require 'pusher'
require 'json'

# Require all in lib directory
Dir[File.dirname(__FILE__) + '/lib/*.rb'].each {|file| require file }

VALID_SIDES = ["red", "blue"]

class App < Sinatra::Application

  # Load config.yml into settings.config variable
  set :config, YAML.load_file("#{root}/config/config.yml")[settings.environment.to_s]

  set :environment, ENV["RACK_ENV"] || "development"

  ######################################################################
  # Configurations for different environments
  ######################################################################

  configure do
    Pusher.app_id = settings.config['pusher_app_id']
    Pusher.key = settings.config['pusher_key']
    Pusher.secret = settings.config['pusher_secret']
  end

  configure :staging do
    enable :logging
  end

  configure :development do
    enable :logging
  end

  ######################################################################

end

helpers do
  include Rack::Utils
  alias_method :h, :escape_html

  # More methods in /helpers/*
end

require_relative 'models/init'
require_relative 'helpers/init'

########################################################################
# Routes/Controllers
########################################################################

def protect_with_http_auth!
  protected!(settings.config["http_auth_username"], settings.config["http_auth_password"])
end

# ----------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------

get '/css/style.css' do
  content_type 'text/css', :charset => 'utf-8'
  scss :'sass/style'
end

get '/' do
  @page_name = "home"

  erb :index, :layout => :'layouts/application'
end


# ----------------------------------------------------------------------
# API
# ----------------------------------------------------------------------
#

post '/api/thought' do
  puts params
  side = params[:side]

  if VALID_SIDES.include? side
    output = {}
    Pusher.trigger('ideas', 'idea', params)

    status HTTP_STATUS_OK
  else
    output = {
      :error => "#{side} cannot add thoughts"
    }

    status HTTP_STATUS_BAD_REQUEST
  end

  content_type :json
  return output.to_json
end

# -----------------------------------------------------------------------
# Error handling
# -----------------------------------------------------------------------

not_found do
  logger.info "not_found: #{request.request_method} #{request.url}"
end

# All errors
error do
  @page_name = "error"
  @is_error = true
  erb :error, :layout => :'layouts/application'
end
