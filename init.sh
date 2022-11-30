rm -rf $HOME/.brew && git clone --depth=1 https://github.com/Homebrew/brew $HOME/.brew && echo 'export PATH=$HOME/.brew/bin:$PATH' >> $HOME/.zshrc && source $HOME/.zshrc && brew update

cd $HOME/goinfre
brew install nodejs

npm i -g @nestjs/cli

git clone https://github.com/alexandregv/42toolbox.git $HOME/goinfre/toolbox
cd $HOME/goinfre/toolbox
sh ./init_docker.sh