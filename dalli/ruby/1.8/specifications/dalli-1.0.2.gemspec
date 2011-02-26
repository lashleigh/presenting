# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{dalli}
  s.version = "1.0.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Mike Perham"]
  s.date = %q{2011-02-03}
  s.description = %q{High performance memcached client for Ruby}
  s.email = %q{mperham@gmail.com}
  s.files = ["lib/action_controller/session/dalli_store.rb", "lib/action_dispatch/middleware/session/dalli_store.rb", "lib/active_support/cache/dalli_store.rb", "lib/active_support/cache/dalli_store23.rb", "lib/dalli/client.rb", "lib/dalli/compatibility.rb", "lib/dalli/memcache-client.rb", "lib/dalli/options.rb", "lib/dalli/ring.rb", "lib/dalli/server.rb", "lib/dalli/socket.rb", "lib/dalli/version.rb", "lib/dalli.rb", "LICENSE", "README.md", "History.md", "Rakefile", "Gemfile", "dalli.gemspec", "Performance.md", "Upgrade.md", "test/abstract_unit.rb", "test/benchmark_test.rb", "test/helper.rb", "test/memcached_mock.rb", "test/test_active_support.rb", "test/test_compatibility.rb", "test/test_dalli.rb", "test/test_encoding.rb", "test/test_failover.rb", "test/test_network.rb", "test/test_ring.rb", "test/test_sasl.rb", "test/test_session_store.rb"]
  s.homepage = %q{http://github.com/mperham/dalli}
  s.rdoc_options = ["--charset=UTF-8"]
  s.require_paths = ["lib"]
  s.rubygems_version = %q{1.3.7}
  s.summary = %q{High performance memcached client for Ruby}
  s.test_files = ["test/abstract_unit.rb", "test/benchmark_test.rb", "test/helper.rb", "test/memcached_mock.rb", "test/test_active_support.rb", "test/test_compatibility.rb", "test/test_dalli.rb", "test/test_encoding.rb", "test/test_failover.rb", "test/test_network.rb", "test/test_ring.rb", "test/test_sasl.rb", "test/test_session_store.rb"]

  if s.respond_to? :specification_version then
    current_version = Gem::Specification::CURRENT_SPECIFICATION_VERSION
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<shoulda>, [">= 0"])
      s.add_development_dependency(%q<mocha>, [">= 0"])
      s.add_development_dependency(%q<rails>, [">= 3.0.1"])
      s.add_development_dependency(%q<memcache-client>, [">= 1.8.5"])
    else
      s.add_dependency(%q<shoulda>, [">= 0"])
      s.add_dependency(%q<mocha>, [">= 0"])
      s.add_dependency(%q<rails>, [">= 3.0.1"])
      s.add_dependency(%q<memcache-client>, [">= 1.8.5"])
    end
  else
    s.add_dependency(%q<shoulda>, [">= 0"])
    s.add_dependency(%q<mocha>, [">= 0"])
    s.add_dependency(%q<rails>, [">= 3.0.1"])
    s.add_dependency(%q<memcache-client>, [">= 1.8.5"])
  end
end
