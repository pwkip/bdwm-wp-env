FROM wordpress:latest
LABEL maintainer Jules Colle <jules@bdwm.be>

RUN apt-get -y update; apt-get -y install curl; apt-get -y install wget;
 
# Install WP-CLI in the wordpress container
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar; ls -la; chmod +x ./wp-cli.phar; mv wp-cli.phar /usr/local/bin/wp-cli

# Install MySQL extension, as WP-CLI needs to access to WordPress database
RUN docker-php-ext-install mysqli

# Install PHPUnit in the container
RUN wget https://phar.phpunit.de/phpunit-7.5.9.phar; chmod +x phpunit-7.5.9.phar; mv phpunit-7.5.9.phar /usr/local/bin/phpunit; phpunit --version

# Install Xdebug
RUN pecl install "xdebug" \
    && docker-php-ext-enable xdebug

RUN echo "xdebug.remote_enable=1" >> /usr/local/etc/php/conf.d/xdebug.ini && \
    echo "xdebug.remote_autostart=1" >> /usr/local/etc/php/conf.d/xdebug.ini && \
    echo "xdebug.remote_port=9000" >> /usr/local/etc/php/conf.d/xdebug.ini && \
    echo "xdebug.idekey=VSCODE" >> /usr/local/etc/php/conf.d/xdebug.ini && \
    echo "xdebug.remote_host=172.17.0.1" >> /usr/local/etc/php/conf.d/xdebug.ini && \
    echo "xdebug.remote_connect_back=0" >> /usr/local/etc/php/conf.d/xdebug.ini
